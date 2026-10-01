"""
Confidence & Uncertainty Quantification Module.
Calculates Shannon Entropy, Prediction Margin, and Uncertainty Flags from Calibrated Probabilities.

Scientific Rationale:
In automated medical screening (e.g., DR|GRADUATE), raw confidence scores do not suffice.
Combining normalized Shannon entropy H_norm(p) = -sum(p_i * log2(p_i)) / log2(C) with
top-1 vs top-2 probability margin Δ = p_(1) - p_(2) provides a robust dual metric for
identifying borderline predictions that require human expert referral.
"""
from typing import Dict, Any, List, Optional
import numpy as np


def compute_uncertainty_metrics(
    probabilities: List[float],
    entropy_threshold: float = 0.85,
    margin_threshold: float = 0.20
) -> Dict[str, Any]:
    """
    Evaluates prediction uncertainty from class probability distribution.

    Args:
        probabilities: List of 5 class probabilities (must sum to 1.0).
        entropy_threshold: Normalized entropy above which prediction is considered uncertain.
        margin_threshold: Probability difference below which prediction is considered uncertain.

    Returns:
        Dict containing Shannon entropy, normalized entropy, margin, top1, top2, and uncertainty flag.
    """
    probs = np.array(probabilities, dtype=np.float32)
    # Clip to avoid log(0)
    probs = np.clip(probs, 1e-7, 1.0)
    probs = probs / np.sum(probs)

    num_classes = len(probs)
    # 1. Shannon Entropy: H(p) = - sum(p * log2(p))
    entropy = -float(np.sum(probs * np.log2(probs)))
    max_entropy = np.log2(num_classes) if num_classes > 1 else 1.0
    normalized_entropy = float(entropy / max_entropy)

    # 2. Prediction Margin (Top 1 - Top 2)
    sorted_probs = np.sort(probs)[::-1]
    top1 = float(sorted_probs[0])
    top2 = float(sorted_probs[1]) if len(sorted_probs) > 1 else 0.0
    margin = float(top1 - top2)

    is_uncertain = (normalized_entropy > entropy_threshold) or (margin < margin_threshold)

    return {
        "is_uncertain": is_uncertain,
        "shannon_entropy": round(entropy, 4),
        "normalized_entropy": round(normalized_entropy, 4),
        "top1_probability": round(top1, 4),
        "top2_probability": round(top2, 4),
        "prediction_margin": round(margin, 4),
        "uncertainty_flag": "HIGH_UNCERTAINTY" if is_uncertain else "STABLE_CONFIDENCE"
    }
