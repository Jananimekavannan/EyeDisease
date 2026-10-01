"""
Explainable AI Module: Grad-CAM (Gradient-weighted Class Activation Mapping).
Generates a Grad-CAM attention map for the frozen E2 model. The map does not
detect or localize lesions.
"""
from typing import Optional, Tuple, Dict, Any
import numpy as np
import cv2
import torch
import torch.nn as nn


class GradCAM:
    """
    Grad-CAM generator for CNN architectures (EfficientNet-B0 candidate).
    """

    def __init__(self, model: nn.Module, target_layer: Optional[nn.Module] = None):
        self.model = model
        self.model.eval()
        self.target_layer = target_layer or self._find_target_layer()

        self.gradients = None
        self.activations = None
        self.handles = []
        self._register_hooks()

    def _find_target_layer(self) -> nn.Module:
        """
        Locates the final convolutional layer of EfficientNet.
        """
        if hasattr(self.model, "conv_head"):
            return self.model.conv_head
        raise ValueError("Frozen E2 EfficientNet-B0 is missing the required conv_head target layer.")

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0].detach()

        self.handles.append(self.target_layer.register_forward_hook(forward_hook))
        self.handles.append(self.target_layer.register_full_backward_hook(backward_hook))

    def generate(
        self,
        input_tensor: torch.Tensor,
        target_class: Optional[int] = None,
        target_referable: bool = False,
    ) -> np.ndarray:
        """
        Generates a 2D normalized heatmap [0, 1] for the specified class.
        """
        self.model.zero_grad()
        output = self.model(input_tensor)

        if target_referable:
            # The handoff target is calibrated P(Grade 2-4), not raw z2.
            # Keep this forward target identical to production inference.
            cumulative = torch.cummin(torch.sigmoid(output.float()), dim=1).values
            boundaries = torch.cat((torch.ones_like(cumulative[:, :1]), cumulative,
                                    torch.zeros_like(cumulative[:, :1])), dim=1)
            class_probs = (boundaries[:, :-1] - boundaries[:, 1:]).clamp_min(1e-6)
            class_probs = class_probs / class_probs.sum(dim=1, keepdim=True)
            calibrated = torch.softmax(torch.log(class_probs) / 2.0687387852231383, dim=1)
            target_score = calibrated[0, 2:].sum()
        elif target_class is None:
            target_class = torch.argmax(output, dim=1).item()
            target_score = output[0, target_class]
        else:
            target_score = output[0, target_class]
        target_score.backward()

        # Global average pooling of gradients
        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)
        cam = torch.sum(weights * self.activations, dim=1, keepdim=True)
        cam = torch.clamp(cam, min=0)  # ReLU on weighted activation

        cam = cam.squeeze().cpu().numpy()
        if np.max(cam) > 0:
            cam = (cam - np.min(cam)) / (np.max(cam) - np.min(cam))
        else:
            cam = np.zeros_like(cam)

        return cam

    def overlay_heatmap(
        self,
        heatmap: np.ndarray,
        original_rgb: np.ndarray,
        alpha: float = 0.5,
        colormap: int = cv2.COLORMAP_JET
    ) -> np.ndarray:
        """
        Overlays the Grad-CAM heatmap onto the fundus photograph.
        """
        h, w = original_rgb.shape[:2]
        heatmap_resized = cv2.resize(heatmap, (w, h))
        heatmap_uint8 = np.uint8(255 * heatmap_resized)
        colored_heatmap = cv2.applyColorMap(heatmap_uint8, colormap)
        colored_heatmap = cv2.cvtColor(colored_heatmap, cv2.COLOR_BGR2RGB)

        overlay = cv2.addWeighted(original_rgb, 1 - alpha, colored_heatmap, alpha, 0)
        return overlay

    def remove_hooks(self):
        for h in self.handles:
            h.remove()
        self.handles.clear()


def explain_prediction(
    model: Optional[nn.Module],
    input_tensor: torch.Tensor,
    original_rgb: np.ndarray,
    target_class: Optional[int] = None,
    target_referable: bool = False
) -> Dict[str, Any]:
    """
    Convenience wrapper to produce Grad-CAM heatmap with transparent status reporting.
    """
    if model is None:
        return {
            "status": "pending_model_training",
            "message": "Grad-CAM explanation requires trained model weights. Train model in Google Colab first.",
            "heatmap_available": False,
            "heatmap_base64": None
        }

    try:
        gradcam = GradCAM(model)
        try:
            heatmap = gradcam.generate(input_tensor, target_class=target_class,
                                       target_referable=target_referable)
            overlay = gradcam.overlay_heatmap(heatmap, original_rgb)
        finally:
            gradcam.remove_hooks()

        return {
            "status": "success",
            "message": "Grad-CAM attention map generated.",
            "heatmap_available": True,
            "raw_heatmap": heatmap,
            "overlay_image": overlay
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Grad-CAM generation failed: {str(e)}",
            "heatmap_available": False
        }
