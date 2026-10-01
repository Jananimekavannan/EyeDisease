"""
Model Service Wrapper for FastAPI.
Provides thread-safe access to the Diabetic Retinopathy inference engine.
"""
import sys
from pathlib import Path
from typing import Dict, Any

# Ensure root repository directory is on sys.path for modular imports
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.config import settings
from ml.inference.predictor import DRPredictor


class ModelService:
    """
    Singleton service manager for ML models.
    """

    _instance = None
    _predictor = None

    @classmethod
    def get_predictor(cls) -> DRPredictor:
        if cls._predictor is None:
            weights_file = settings.efficientnet_weights_path
            cls._predictor = DRPredictor(weights_path=weights_file)
        return cls._predictor

    @classmethod
    def reload_weights(cls) -> bool:
        """
        Allows re-loading weights at runtime after Colab training without server restart.
        """
        cls._predictor = DRPredictor(weights_path=settings.efficientnet_weights_path)
        return cls._predictor.is_weights_loaded

    @classmethod
    def predict(cls, image_bytes: bytes) -> Dict[str, Any]:
        predictor = cls.get_predictor()
        return predictor.predict(image_bytes)
