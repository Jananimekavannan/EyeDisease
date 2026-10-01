"""
Diabetic Retinopathy Model Predictor.
Candidate Architecture: Standardized timm EfficientNet-B0.

Behavior:
- Strictly imports model creation from canonical `ml.models.model_factory`.
- Checks if trained weights exist in `ml/weights/efficientnet_b0_aptos.pth`.
- If found: executes inference, applies Temperature Scaling calibration, calculates Shannon entropy & margin.
- If not found: returns a transparent status indicating model training is pending. NEVER invents fake predictions.
"""
from pathlib import Path
from typing import Dict, Any, Optional
import hashlib
import numpy as np

try:
    import torch
    TORCH_AVAILABLE = True
except (ImportError, OSError):
    TORCH_AVAILABLE = False
    torch = None

from ml.models.model_factory import DEFAULT_MODEL_NAME
from ml.inference.preprocessing import preprocess_fundus_image, PreprocessConfig, DEFAULT_PREPROCESS_CONFIG
from ml.inference.calibration import TemperatureScaler, default_scaler

DR_SEVERITY_LEVELS = [
    {"grade": 0, "name": "No DR", "description": "Ordinal model class 0; clinical confirmation is required."},
    {"grade": 1, "name": "Mild NPDR", "description": "Ordinal model class 1; clinical confirmation is required."},
    {"grade": 2, "name": "Moderate NPDR", "description": "Ordinal model class 2; clinical confirmation is required."},
    {"grade": 3, "name": "Severe NPDR", "description": "Ordinal model class 3; clinical confirmation is required."},
    {"grade": 4, "name": "Proliferative DR", "description": "Ordinal model class 4; clinical confirmation is required."}
]
PRODUCTION_TEMPERATURE = 2.0687387852231383
PRODUCTION_REFERABLE_THRESHOLD = 0.29
PRODUCTION_CHECKPOINT_SHA256 = "6c342eb3bf432fce8a078e55a9027a4c107bdaabe1e55c23d2c8070b3bd7c24a"


class ModelUnavailableError(RuntimeError):
    """Raised when the frozen production checkpoint cannot be loaded."""


class DRPredictor:
    """
    Inference manager for DR severity grading with Temperature Calibration.
    """

    def __init__(
        self,
        weights_path: Optional[Path] = None,
        device: Optional[str] = None,
        scaler: Optional[TemperatureScaler] = None,
        preprocess_config: Optional[PreprocessConfig] = None
    ):
        self.weights_path = Path(weights_path) if weights_path else Path(__file__).resolve().parent.parent / "weights" / "efficientnet_b0_aptos.pth"
        self.device = device or ("cuda" if TORCH_AVAILABLE and torch and torch.cuda.is_available() else "cpu")
        self.scaler = scaler or TemperatureScaler(PRODUCTION_TEMPERATURE)
        self.preprocess_config = preprocess_config or DEFAULT_PREPROCESS_CONFIG
        self.model: Optional[Any] = None
        self.is_weights_loaded: bool = False
        self._initialize_model()

    def _initialize_model(self):
        """
        Attempts to load E2 Ordinal EfficientNet-B0 architecture and weights via model_factory.
        """
        if not TORCH_AVAILABLE:
            self.is_weights_loaded = False
            self.model = None
            return

        try:
            if self.weights_path.exists():
                if not self.weights_path.is_file():
                    raise FileNotFoundError(self.weights_path)
                digest = hashlib.sha256(self.weights_path.read_bytes()).hexdigest()
                if digest != PRODUCTION_CHECKPOINT_SHA256:
                    raise ValueError("Production checkpoint SHA-256 verification failed.")
                ck = torch.load(self.weights_path, map_location="cpu", weights_only=True)
                if not isinstance(ck, dict) or "config" not in ck or "model_state" not in ck:
                    raise ValueError("Checkpoint is missing production config/model_state metadata.")
                cfg = ck["config"]
                arch = cfg["arch"]
                num_classes = cfg["num_classes_model_output"]
                drop_rate = cfg["drop_rate"]
                if arch != DEFAULT_MODEL_NAME or num_classes != 4:
                    raise ValueError("Checkpoint metadata does not match E2 ordinal EfficientNet-B0.")
                import timm
                self.model = timm.create_model(arch, pretrained=False, num_classes=num_classes, drop_rate=drop_rate)
                self.model.load_state_dict(ck["model_state"], strict=True)
                self.model.to(self.device)
                self.model.eval()
                self.is_weights_loaded = True
                print(f"[+] Loaded trained model weights from {self.weights_path}")
            else:
                self.model = None
                self.is_weights_loaded = False
                print(f"[!] Production model unavailable at {self.weights_path}.")
        except Exception as e:
            self.is_weights_loaded = False
            self.model = None
            print(f"[!] Warning during model initialization: {e}")

    def predict(self, image_bytes_or_array) -> Dict[str, Any]:
        """
        Executes crop_pad_512 preprocessing, E2 ordinal inference, and T=2.0687 calibration.
        """
        # 1. Preprocess input image using validated E2 config
        input_tensor, processed_rgb = preprocess_fundus_image(image_bytes_or_array, config=self.preprocess_config)

        # 2. Transparent handling when trained model weights are missing or Torch is unavailable
        if not TORCH_AVAILABLE or not self.is_weights_loaded or self.model is None:
            raise ModelUnavailableError("Production model unavailable.")

        # 3. Model Inference & E2 Ordinal Decoding (T=2.0687387852231383)
        with torch.no_grad():
            tensor = input_tensor.to(self.device)
            raw_logits = self.model(tensor).float()
            # Match the frozen MODEL/dr_infer.py implementation: enforce ordinal
            # monotonicity, decode five classes, then temperature-scale log probs.
            cumulative = torch.cummin(torch.sigmoid(raw_logits), dim=1).values
            boundaries = torch.cat((torch.ones_like(cumulative[:, :1]), cumulative,
                                    torch.zeros_like(cumulative[:, :1])), dim=1)
            raw_class_probs = (boundaries[:, :-1] - boundaries[:, 1:]).clamp_min(1e-6)
            raw_class_probs = raw_class_probs / raw_class_probs.sum(dim=1, keepdim=True)
            raw_disc_probs = raw_class_probs[0].cpu().numpy().astype(np.float64)
            calibrated = torch.softmax(torch.log(raw_class_probs) / float(self.scaler.temperature), dim=1)
            disc_probs = calibrated[0].cpu().numpy().astype(np.float64)
            
            predicted_idx = int(np.argmax(disc_probs))
            confidence = float(disc_probs[predicted_idx])
            
            # Production definition: calibrated P(Grade 2-4) = calibrated class probability[2] + [3] + [4]
            p_referable = float(disc_probs[2:].sum())
            referable = bool(p_referable >= PRODUCTION_REFERABLE_THRESHOLD)

        grade_info = DR_SEVERITY_LEVELS[predicted_idx]
        grade_probs_dict = {
            "grade_0": float(disc_probs[0]),
            "grade_1": float(disc_probs[1]),
            "grade_2": float(disc_probs[2]),
            "grade_3": float(disc_probs[3]),
            "grade_4": float(disc_probs[4])
        }
        calibrated_probs_dict = {
            item["name"]: float(disc_probs[i])
            for i, item in enumerate(DR_SEVERITY_LEVELS)
        }
        raw_probs_dict = {
            f"grade_{i}": float(raw_disc_probs[i])
            for i in range(5)
        }

        return {
            "status": "success",
            "is_placeholder": False,
            "message": "Inference successfully computed with E2 Ordinal EfficientNet-B0 model.",
            "model_name": "E2 Ordinal EfficientNet-B0",
            "grade": grade_info["grade"],
            "grade_probabilities": grade_probs_dict,
            "confidence": confidence,
            "p_referable": p_referable,
            "referable": referable,
            "predicted_grade": grade_info["grade"],
            "severity_label": grade_info["name"],
            "description": grade_info["description"],
            "raw_probabilities": raw_probs_dict,
            "calibrated_probabilities": calibrated_probs_dict,
            "class_probabilities": calibrated_probs_dict,
            "referable_dr": referable,
            "preprocessing_completed": True
        }
