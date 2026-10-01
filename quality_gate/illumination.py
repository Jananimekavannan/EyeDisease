"""
Retinal Illumination, Exposure and Contrast Assessment.
Identifies overexposed flash artifacts, dark underexposed captures, and low-contrast images.
"""
from typing import Dict, Any
import cv2
import numpy as np


def evaluate_illumination(
    image_rgb: np.ndarray,
    min_mean_lum: float = 35.0,
    max_mean_lum: float = 210.0,
    max_overexposed_ratio: float = 0.08
) -> Dict[str, Any]:
    """
    Evaluates retinal illumination profile within the field of view.
    """
    gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
    fundus_mask = gray > 15

    if not np.any(fundus_mask):
        return {
            "is_well_illuminated": False,
            "mean_luminance": 0.0,
            "contrast_std": 0.0,
            "overexposed_ratio": 0.0,
            "underexposed_ratio": 1.0,
            "issue": "Image appears entirely dark or unexposed."
        }

    fundus_pixels = gray[fundus_mask]
    mean_lum = float(np.mean(fundus_pixels))
    std_lum = float(np.std(fundus_pixels))

    overexposed_ratio = float(np.mean(fundus_pixels > 240))
    underexposed_ratio = float(np.mean(fundus_pixels < 25))

    is_overexposed = overexposed_ratio > max_overexposed_ratio
    is_underexposed = mean_lum < min_mean_lum

    is_well_illuminated = (not is_overexposed) and (not is_underexposed) and (mean_lum <= max_mean_lum)

    issue = None
    if is_overexposed:
        issue = "Excessive flash reflection or cornea glare detected."
    elif is_underexposed:
        issue = "Insufficient illumination or poor pupil dilation."

    return {
        "is_well_illuminated": is_well_illuminated,
        "mean_luminance": round(mean_lum, 2),
        "contrast_std": round(std_lum, 2),
        "overexposed_ratio": round(overexposed_ratio, 4),
        "underexposed_ratio": round(underexposed_ratio, 4),
        "issue": issue
    }
