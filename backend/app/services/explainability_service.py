"""
Explainability Service for FastAPI.
Generates Grad-CAM visual heatmaps and encodes outputs to Base64 data URLs for frontend rendering.
"""
import sys
import base64
from pathlib import Path
from typing import Dict, Any, Optional
import cv2

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ml.inference.preprocessing import preprocess_fundus_image
from ml.explainability.gradcam import explain_prediction
from backend.app.services.model_service import ModelService


class ExplainabilityService:
    @staticmethod
    def generate_gradcam(image_bytes: bytes, target_class: Optional[int] = None) -> Dict[str, Any]:
        predictor = ModelService.get_predictor()

        if not predictor.is_weights_loaded or predictor.model is None:
            return {
                "available": False,
                "status": "pending_model_weights",
                "message": "Grad-CAM unavailable because the production model is unavailable.",
                "heatmap_base64": None,
                "overlay_base64": None
            }

        try:
            tensor, original_rgb = preprocess_fundus_image(image_bytes)
            explanation = explain_prediction(
                model=predictor.model,
                input_tensor=tensor,
                original_rgb=original_rgb,
                target_class=target_class,
                target_referable=True
            )

            if explanation.get("heatmap_available"):
                overlay = explanation["overlay_image"]
                # Convert RGB to BGR for OpenCV encoding
                overlay_bgr = cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR)
                _, buffer = cv2.imencode(".png", overlay_bgr)
                overlay_b64 = "data:image/png;base64," + base64.b64encode(buffer).decode("utf-8")

                return {
                    "available": True,
                    "status": "success",
                    "message": "Grad-CAM explanation generated successfully.",
                    "overlay_base64": overlay_b64
                }
            else:
                return {
                    "available": False,
                    "status": "error",
                    "message": explanation.get("message", "Unable to compute Grad-CAM."),
                    "overlay_base64": None
                }
        except Exception as e:
            return {
                "available": False,
                "status": "error",
                "message": "Grad-CAM generation failed.",
                "overlay_base64": None
            }
