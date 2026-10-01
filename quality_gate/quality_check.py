"""
Master Quality Gate Evaluator for Retinal Fundus Screening.
Synthesizes focus, illumination, and field validity into a gradability decision.

Important:
- Quality is evaluated on the retinal/fundus region, not on black or white borders.
- This gate does not produce a DR diagnosis.
- Thresholds are engineering rules for the prototype, not clinical standards.
"""
from typing import Dict, Any, Union
import cv2
import numpy as np

from quality_gate.blur_detection import evaluate_blur
from quality_gate.illumination import evaluate_illumination


def _estimate_fundus_mask(img_rgb: np.ndarray) -> np.ndarray:
    """Estimate the retinal field while excluding black/white capture borders."""
    if img_rgb.ndim != 3 or img_rgb.shape[2] != 3:
        raise ValueError("Expected an RGB image with shape HxWx3.")

    h, w = img_rgb.shape[:2]
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)

    saturation = hsv[..., 1]
    value = hsv[..., 2]

    # Fundus tissue is generally chromatic (orange/red/brown), while white
    # borders and black capture backgrounds are comparatively achromatic.
    red, green, blue = cv2.split(img_rgb.astype(np.float32))
    warm_tissue = (red > green * 1.02) & (green >= blue * 0.90)
    chromatic_tissue = saturation > 20
    non_dark = gray > 15

    candidate = non_dark & (chromatic_tissue | warm_tissue) & (value > 20)

    # Restrict detection to the central retinal field so UI/camera borders do
    # not dominate illumination or focus measurements.
    yy, xx = np.ogrid[:h, :w]
    cx, cy = (w - 1) / 2.0, (h - 1) / 2.0
    rx, ry = max(w * 0.47, 1.0), max(h * 0.47, 1.0)
    central_field = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1.0
    candidate &= central_field

    # Keep the largest connected tissue component when possible.
    mask = (candidate.astype(np.uint8) * 255)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)

    if num_labels > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest_label = 1 + int(np.argmax(areas))
        mask = np.where(labels == largest_label, 255, 0).astype(np.uint8)

    coverage = float(np.mean(mask > 0))

    # Conservative fallback for grayscale/low-saturation fundus captures.
    if coverage < 0.08:
        fallback = (
            central_field
            & (gray > 15)
            & (gray < 245)
        )
        mask = (fallback.astype(np.uint8) * 255)

    return mask


def assess_image_quality(
    image_input: Union[bytes, np.ndarray],
    blur_threshold: float = 100.0
) -> Dict[str, Any]:
    """
    Runs the prototype quality gate on the actual retinal field.

    Returns:
      is_gradable, status, quality_score, component metrics, issues,
      and an actionable recommendation.
    """
    if isinstance(image_input, (bytes, bytearray)):
        nparr = np.frombuffer(image_input, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            try:
                from PIL import Image
                import io
                pil_img = Image.open(io.BytesIO(image_input)).convert("RGB")
                img_rgb = np.array(pil_img)
            except Exception:
                return {
                    "is_gradable": False,
                    "status": "rejected",
                    "reason": "Corrupt or unreadable image file.",
                    "quality_score": 0.0,
                    "blur_metrics": {"is_sharp": False, "blur_score": 0.0},
                    "illumination_metrics": {"is_well_illuminated": False},
                    "identified_issues": ["Corrupt or unreadable image file."],
                    "action_required": "Re-capture fundus photograph."
                }
        else:
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    elif isinstance(image_input, np.ndarray):
        img_rgb = image_input
    else:
        raise TypeError("Expected bytes or numpy ndarray")

    if img_rgb.ndim != 3 or img_rgb.shape[2] != 3:
        raise ValueError("Expected an RGB image with three channels.")

    fundus_mask = _estimate_fundus_mask(img_rgb)
    fundus_coverage = float(np.mean(fundus_mask > 0))

    blur_res = evaluate_blur(img_rgb, blur_threshold=blur_threshold)
    # Recompute blur on the actual fundus mask rather than the whole frame.
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    valid_lap = lap[fundus_mask > 0]
    blur_score = float(np.var(valid_lap)) if valid_lap.size else 0.0
    blur_res["blur_score"] = round(blur_score, 2)
    blur_res["is_sharp"] = bool(blur_score >= blur_threshold)
    blur_res["recommendation"] = (
        "Image focus acceptable." if blur_res["is_sharp"]
        else "Image is blurry or out of focus. Please stabilize and re-capture."
    )

    illum_res = evaluate_illumination(img_rgb)
    fundus_pixels = gray[fundus_mask > 0]
    if fundus_pixels.size:
        mean_lum = float(np.mean(fundus_pixels))
        std_lum = float(np.std(fundus_pixels))
        overexposed_ratio = float(np.mean(fundus_pixels > 240))
        underexposed_ratio = float(np.mean(fundus_pixels < 25))
        illum_res.update({
            "mean_luminance": round(mean_lum, 2),
            "contrast_std": round(std_lum, 2),
            "overexposed_ratio": round(overexposed_ratio, 4),
            "underexposed_ratio": round(underexposed_ratio, 4),
        })
        is_overexposed = overexposed_ratio > 0.08
        is_underexposed = mean_lum < 35.0
        illum_res["is_well_illuminated"] = (
            not is_overexposed and
            not is_underexposed and
            mean_lum <= 210.0
        )
        if is_overexposed:
            illum_res["issue"] = "Excessive flash reflection or corneal glare detected."
        elif is_underexposed:
            illum_res["issue"] = "Insufficient illumination or poor pupil dilation."
        else:
            illum_res["issue"] = None
    else:
        illum_res["is_well_illuminated"] = False
        illum_res["issue"] = "No usable retinal field detected."

    is_gradable = (
        fundus_coverage >= 0.08
        and blur_res["is_sharp"]
        and illum_res["is_well_illuminated"]
    )

    issues = []
    if fundus_coverage < 0.08:
        issues.append("Insufficient visible retinal field.")
    if not blur_res["is_sharp"]:
        issues.append("Image is blurry (low Laplacian edge variance).")
    if not illum_res["is_well_illuminated"]:
        issues.append(illum_res.get("issue") or "Suboptimal illumination.")

    # Continuous prototype quality score. This is a quality indicator, not a
    # clinical probability and not a DR confidence score.
    blur_subscore = min(50.0, max(0.0, (blur_score / 250.0) * 50.0))
    contrast_val = float(illum_res.get("contrast_std", 0.0))
    contrast_subscore = min(50.0, max(0.0, (contrast_val / 45.0) * 50.0))
    coverage_subscore = min(1.0, max(0.0, fundus_coverage / 0.20))
    quality_score = (blur_subscore + contrast_subscore) * (0.75 + 0.25 * coverage_subscore)
    quality_score = min(100.0, max(0.0, quality_score))

    if not is_gradable:
        quality_score = min(quality_score, 45.0)

    return {
        "is_gradable": bool(is_gradable),
        "status": "accepted" if is_gradable else "rejected",
        "quality_score": round(float(quality_score), 1),
        "fundus_coverage": round(fundus_coverage, 4),
        "blur_metrics": blur_res,
        "illumination_metrics": illum_res,
        "identified_issues": issues,
        "action_required": (
            "Proceed to AI Analysis."
            if is_gradable
            else "Re-capture fundus photograph with stable positioning and adequate illumination."
        )
    }
