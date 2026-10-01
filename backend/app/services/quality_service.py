"""
Quality Service for FastAPI.
Evaluates fundus image blur, illumination, and clinical gradability.
"""
import sys
from pathlib import Path
from typing import Dict, Any

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from quality_gate.quality_check import assess_image_quality
from backend.app.config import settings


class QualityService:
    @staticmethod
    def evaluate(image_bytes: bytes) -> Dict[str, Any]:
        return assess_image_quality(image_bytes, blur_threshold=settings.blur_threshold)
