"""
Production Preprocessing Pipeline for Fundus Retinal Images.
Prepares raw user uploads for model inference and Grad-CAM generation.
"""
from dataclasses import dataclass
from typing import Tuple, Optional
import cv2
import numpy as np
import torch


@dataclass
class PreprocessConfig:
    """
    Canonical preprocessing configuration to maintain strict parity
    between ML training (Colab) and FastAPI runtime inference.
    """
    image_size: Tuple[int, int] = (224, 224)
    crop_tolerance: int = 10
    ben_graham_sigma: int = 10
    apply_clahe: bool = False
    clahe_clip_limit: float = 2.0
    clahe_grid_size: Tuple[int, int] = (8, 8)
    channel_order: str = "RGB"
    mean: Tuple[float, float, float] = (0.485, 0.456, 0.406)
    std: Tuple[float, float, float] = (0.229, 0.224, 0.225)


DEFAULT_PREPROCESS_CONFIG = PreprocessConfig()


def crop_fundus_circle(img: np.ndarray, tol: int = 10) -> np.ndarray:
    """
    Crops out unexposed black margins surrounding the circular fundus lens.
    """
    if img.ndim not in (2, 3):
        raise ValueError("Expected a grayscale or three-channel image.")
    # Frozen dr_infer.crop_pad_512 crops on max(channel)>10, not grayscale;
    # this preserves the exact field bounds for saturated red/blue pixels.
    mask = img > tol if img.ndim == 2 else np.max(img, axis=2) > tol
    if np.count_nonzero(mask) <= 0.05 * mask.size:
        return img
    coords = np.argwhere(mask)
    if coords.size == 0:
        return img
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0) + 1
    return img[y0:y1, x0:x1]


def crop_pad_512(img: np.ndarray, target_size: int = 512, tol: int = 10) -> np.ndarray:
    """
    E2 Validated Preprocessing Stage 1:
    Crops out unexposed black margins surrounding the circular fundus lens,
    then pads the image into a square target_size x target_size (512x512) array.
    """
    img_cropped = crop_fundus_circle(img, tol=tol)
    h, w = img_cropped.shape[:2]
    max_dim = max(h, w)
    square = np.zeros((max_dim, max_dim, 3), dtype=img_cropped.dtype)
    y_off = (max_dim - h) // 2
    x_off = (max_dim - w) // 2
    square[y_off:y_off + h, x_off:x_off + w] = img_cropped
    return cv2.resize(square, (target_size, target_size), interpolation=cv2.INTER_AREA)


def apply_ben_graham(img: np.ndarray, sigmaX: int = 10) -> np.ndarray:
    """
    Ben Graham illumination normalization helper (retained for auxiliary tools/analysis).
    """
    blurred = cv2.GaussianBlur(img, (0, 0), sigmaX)
    return cv2.addWeighted(img, 4, blurred, -4, 128)


def preprocess_fundus_image(
    image_bytes_or_array,
    config: Optional[PreprocessConfig] = None,
    target_size: Optional[Tuple[int, int]] = None
) -> Tuple[torch.Tensor, np.ndarray]:
    """
    Production E2 Preprocessing Pipeline:
    crop_pad_512 -> resize -> ImageNet normalization.
    """
    if config is None:
        config = DEFAULT_PREPROCESS_CONFIG
    image_size = target_size or config.image_size
    if isinstance(image_bytes_or_array, (bytes, bytearray)):
        nparr = np.frombuffer(image_bytes_or_array, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image bytes: Unable to decode fundus image.")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    elif isinstance(image_bytes_or_array, np.ndarray):
        img = image_bytes_or_array.copy()
        if img.shape[2] == 4:  # RGBA
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
    else:
        raise TypeError("Input must be raw bytes or numpy.ndarray")

    # 1. Validated E2 preprocessing: crop_pad_512
    img_512 = crop_pad_512(img, target_size=512, tol=config.crop_tolerance)

    # 2. Resize to model input size (224x224)
    processed_rgb = cv2.resize(img_512, image_size, interpolation=cv2.INTER_AREA)

    # 3. Normalize for PyTorch (ImageNet mean & std)
    mean = np.array(config.mean, dtype=np.float32)
    std = np.array(config.std, dtype=np.float32)
    norm_img = (processed_rgb.astype(np.float32) / 255.0 - mean) / std

    # Convert to Tensor [1, 3, H, W]
    tensor = torch.tensor(norm_img.transpose(2, 0, 1), dtype=torch.float32).unsqueeze(0)

    return tensor, processed_rgb
