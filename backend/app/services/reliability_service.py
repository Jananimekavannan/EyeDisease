"""
Reliability Service for FastAPI.
Interfaces with the clinical decision engine, uncertainty estimation, and evidence fusion.
"""
import sys
from pathlib import Path
from typing import Dict, Any, Optional

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from reliability.decision_engine import ClinicalDecisionEngine
from reliability.confidence import compute_uncertainty_metrics
from reliability.evidence_fusion import evaluate_evidence_consistency
from backend.app.config import settings


class ReliabilityService:
    _engine = None

    @classmethod
    def get_engine(cls) -> ClinicalDecisionEngine:
        if cls._engine is None:
            cls._engine = ClinicalDecisionEngine(confidence_threshold=settings.confidence_threshold)
        return cls._engine

    @classmethod
    def evaluate_triage(
        cls,
        quality_res: Dict[str, Any],
        prediction_res: Dict[str, Any],
        lesion_res: Optional[Dict[str, Any]] = None,
        gradcam_res: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        engine = cls.get_engine()

        # Compute uncertainty if class probabilities exist
        uncertainty_res = None
        probs_dict = prediction_res.get("calibrated_probabilities") or prediction_res.get("class_probabilities")
        if probs_dict:
            probs = list(probs_dict.values())
            uncertainty_res = compute_uncertainty_metrics(probs)

        # Evidence fusion
        fusion_res = evaluate_evidence_consistency(
            predicted_grade=prediction_res.get("predicted_grade"),
            lesion_summary=lesion_res.get("lesion_summary") if lesion_res else None
        )

        return engine.evaluate_triage(
            quality_result=quality_res,
            prediction_result=prediction_res,
            uncertainty_result=uncertainty_res,
            fusion_result=fusion_res,
            gradcam_result=gradcam_res
        )
