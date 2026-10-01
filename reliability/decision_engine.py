"""
Clinical Decision & Triage Engine.
Synthesizes Image Quality Gate, Calibrated DR Prediction, Uncertainty Metrics,
and Evidence Fusion to produce auditable clinical triage decisions.

AUDITABLE TRIAGE DECISIONS:
- RELIABLE_SCREENING
- HUMAN_REVIEW_RECOMMENDED
- IMAGE_RECAPTURE_REQUIRED

DISCLAIMER ON THRESHOLDS:
Thresholds (confidence >= 0.70, entropy <= 0.85, margin >= 0.20) are INITIAL ENGINEERING THRESHOLDS
for software prototype testing and ARE NOT clinically validated operational guidelines.
"""
from typing import Dict, Any, Optional, List
from enum import Enum


class TriageDecision(str, Enum):
    RELIABLE_SCREENING = "RELIABLE_SCREENING"
    HUMAN_REVIEW_RECOMMENDED = "HUMAN_REVIEW_RECOMMENDED"
    IMAGE_RECAPTURE_REQUIRED = "IMAGE_RECAPTURE_REQUIRED"


class ClinicalDecisionEngine:
    """
    Rule-based clinical decision engine returning explicit, machine-readable reason codes for auditability.
    """

    def __init__(self, confidence_threshold: float = 0.70):
        # Initial engineering threshold ONLY
        self.confidence_threshold = confidence_threshold

    def evaluate_triage(
        self,
        quality_result: Dict[str, Any],
        prediction_result: Dict[str, Any],
        uncertainty_result: Optional[Dict[str, Any]] = None,
        fusion_result: Optional[Dict[str, Any]] = None,
        gradcam_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Computes final triage recommendation with explicit, auditable reason codes.
        """
        evidence_status = fusion_result.get("evidence_status", "unavailable") if fusion_result else "unavailable"
        lesion_status = fusion_result.get("lesion_status", "unavailable") if fusion_result else "unavailable"

        # 1. Quality Gate Check
        if not quality_result.get("is_gradable", True):
            reasons = []
            for issue in quality_result.get("identified_issues", []):
                if "blur" in issue.lower():
                    reasons.append("optical_blur_detected")
                elif "illumination" in issue.lower() or "dark" in issue.lower():
                    reasons.append("poor_illumination")
                else:
                    reasons.append("image_quality_failed")
            if not reasons:
                reasons = ["image_quality_failed"]

            return {
                "decision": TriageDecision.IMAGE_RECAPTURE_REQUIRED.value,
                "reasons": reasons,
                "referable_dr": False,
                "evidence_status": evidence_status,
                "lesion_status": lesion_status,
                "action_steps": [
                    "Re-align patient pupil with non-mydriatic fundus camera.",
                    "Ensure darkened screening environment.",
                    "Verify absence of corneal glare or motion blur."
                ]
            }

        # 2. Check if model is in pending placeholder state
        if prediction_result.get("is_placeholder", False):
            return {
                "decision": "PENDING_MODEL_TRAINING",
                "reasons": ["model_weights_missing"],
                "referable_dr": False,
                "evidence_status": evidence_status,
                "lesion_status": lesion_status,
                "action_steps": ["Train EfficientNet-B0 on APTOS 2019 dataset and export weights."]
            }

        # 3. Uncertainty, Confidence & Conflict Checks
        reasons = []
        confidence = prediction_result.get("confidence")
        # The production referable result is calibrated P(Grade 2-4) >= 0.29.
        # Do not infer it from the winning class; those rules are not equivalent.
        referable_dr = bool(prediction_result.get("referable", False))

        if confidence is not None and confidence < self.confidence_threshold:
            reasons.append("low_calibrated_confidence")

        if uncertainty_result:
            if uncertainty_result.get("normalized_entropy", 0.0) > 0.85:
                reasons.append("high_probability_entropy")
            if uncertainty_result.get("prediction_margin", 1.0) < 0.20:
                reasons.append("small_prediction_margin")

        if fusion_result and fusion_result.get("evidence_status") == "conflicting":
            reasons.append("evidence_conflict_detected")

        if gradcam_result and not gradcam_result.get("available", True):
            reasons.append("gradcam_unavailable")

        # 4. Human Review Routing if any risk or uncertainty condition was flagged
        if len(reasons) > 0:
            return {
                "decision": TriageDecision.HUMAN_REVIEW_RECOMMENDED.value,
                "reasons": reasons,
                "referable_dr": referable_dr,
                "evidence_status": evidence_status,
                "lesion_status": lesion_status,
                "action_steps": [
                    "Request independent review by a qualified clinician.",
                    "Arrange clinical follow-up as appropriate."
                ]
            }

        # 5. Reliable Screening Result
        return {
            "decision": TriageDecision.RELIABLE_SCREENING.value,
                "reasons": ["model_confidence_and_uncertainty_within_engineering_thresholds"],
            "referable_dr": referable_dr,
            "evidence_status": evidence_status,
            "lesion_status": lesion_status,
                "action_steps": [
                    "Treat this as a prototype model output and obtain clinical confirmation."
                ]
        }
