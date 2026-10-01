"""
Clinical Evidence Fusion Module.
Reconciles whole-image DR classification with localized lesion segmentation findings.

EVIDENCE STATUS DEFINITIONS:
- unavailable: Lesion detector unavailable or not provided. System safely operates on Quality Gate + Calibrated EfficientNet-B0 + Grad-CAM.
- supportive: Classification grade concordant with localized lesion detection (e.g. Grade 0 with no lesions, or Grade 2+ with detected exudates/microaneurysms).
- conflicting: Structural discrepancy flagged (e.g. Grade 0 predicted but microaneurysms/exudates detected).

CRITICAL DISCLAIMER:
Grad-CAM is a gradient visual explanation tool for interpretability, NOT a clinically confirmed lesion detector.
Grad-CAM maps should never be labeled as confirmed clinical evidence.
"""
from typing import Dict, Any, Optional


def evaluate_evidence_consistency(
    predicted_grade: Optional[int],
    lesion_summary: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Evaluates evidence status between DR classifier and localized lesion detector.
    """
    if lesion_summary is None or not lesion_summary:
        return {
            "evidence_status": "unavailable",
            "lesion_status": "unavailable",
            "is_consistent": True,
            "conflict_detected": False,
            "reasons": [],
            "notes": "Lesion evidence detector unavailable or not provided. Pipeline operating via Quality Gate, Calibrated Model, and Grad-CAM."
        }

    # Clinical rules check when lesion evidence IS available
    has_microaneurysms = lesion_summary.get("microaneurysms", {}).get("detected", False)
    has_haemorrhages = lesion_summary.get("haemorrhages", {}).get("detected", False)
    has_exudates = lesion_summary.get("hard_exudates", {}).get("detected", False)

    conflict = False
    reasons = []

    # Rule 1: Grade 0 (No DR) claimed, but localized lesion detector identified microaneurysms/haemorrhages/exudates
    if predicted_grade == 0 and (has_microaneurysms or has_haemorrhages or has_exudates):
        conflict = True
        reasons.append("Model classified Grade 0 (No DR), but lesion detector identified microaneurysms/haemorrhages/exudates.")

    # Rule 2: Grade 4 (PDR) claimed, but no hemorrhage signature detected
    if predicted_grade == 4 and not has_haemorrhages:
        conflict = True
        reasons.append("Proliferative DR predicted with low hemorrhage signature. Verification advised.")

    evidence_status = "conflicting" if conflict else "supportive"

    return {
        "evidence_status": evidence_status,
        "lesion_status": "available",
        "is_consistent": not conflict,
        "conflict_detected": conflict,
        "reasons": reasons,
        "notes": "Evidence concordant." if not conflict else "Discrepancy flagged between classifier and lesion detector."
    }
