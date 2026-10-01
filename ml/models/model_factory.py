
"""
Canonical Model Factory for Diabetic Retinopathy Classification.
Provides the E2 EfficientNet-B0 architecture specification used by training and
the production checkpoint loader.
"""
from typing import Optional

try:
    import torch
    TORCH_AVAILABLE = True
except (ImportError, OSError):
    TORCH_AVAILABLE = False
    torch = None

try:
    import timm
except (ImportError, OSError):
    timm = None


DEFAULT_MODEL_NAME = "efficientnet_b0"
DEFAULT_NUM_CLASSES = 4  # E2 ordinal head outputs 4 cumulative logits (p1..p4)
DEFAULT_DROP_RATE = 0.3


def create_dr_model(
    model_name: str = DEFAULT_MODEL_NAME,
    num_classes: int = DEFAULT_NUM_CLASSES,
    pretrained: bool = False,
    drop_rate: float = DEFAULT_DROP_RATE
):
    """
    Constructs the canonical network with timm. Production checkpoint loading
    must fail if timm is unavailable; it must never substitute another library's model.
    Standardized on EfficientNet-B0 to guarantee consistent state_dict key structure
    across training, checkpoint saving, and inference.
    """
    if not TORCH_AVAILABLE:
        raise RuntimeError("PyTorch is unavailable in the current runtime environment.")

    if timm is None:
        raise RuntimeError("timm is unavailable; refusing to substitute a different model implementation.")
    return timm.create_model(
        model_name,
        pretrained=pretrained,
        num_classes=num_classes,
        drop_rate=drop_rate
    )


def get_model_target_layer(model):
    """
    Returns the canonical target convolutional layer for Grad-CAM explainability.
    For timm EfficientNet-B0, this is consistently `conv_head`.
    """
    if hasattr(model, "conv_head"):
        return model.conv_head
    raise AttributeError("Model does not have 'conv_head' layer expected for timm EfficientNet-B0.")
