"""
Retinal Blur and Defocus Detection.
Uses Laplacian variance and high-frequency edge gradients to determine focus sharpness.
"""
from typing import Dict, Any
import cv2
import numpy as np


def compute_laplacian_variance(gray_img: np.ndarray, mask: np.ndarray = None) -> float:
    """
    Computes the focus measure using the variance of the Laplacian.
    Higher values signify sharper focus; values below threshold indicate blur.
    """
    laplacian = cv2.Laplacian(gray_img, cv2.CV_64F)
    if mask is not None:
        valid_laplacian = laplacian[mask > 0]
        if len(valid_laplacian) == 0:
            return 0.0
        return float(np.var(valid_laplacian))
    return float(np.var(laplacian))


def evaluate_blur(
    image_rgb: np.ndarray,
    blur_threshold: float = 100.0
) -> Dict[str, Any]:
    """
    Analyzes fundus image for motion and optical blur.
    """
    gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
    # Mask out background border
    mask = (gray > 15).astype(np.uint8)

    score = compute_laplacian_variance(gray, mask)
    is_sharp = bool(score >= blur_threshold)

    return {
        "is_sharp": is_sharp,
        "blur_score": round(score, 2),
        "blur_threshold": blur_threshold,
        "recommendation": "Image focus acceptable." if is_sharp else "Image is blurry or out of focus. Please stabilize and re-capture."
    }
