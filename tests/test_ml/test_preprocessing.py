"""
Unit Tests for Retinal Image Preprocessing and Ben Graham Augmentation.
"""
import sys
from pathlib import Path
import numpy as np
import pytest

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ml.inference.preprocessing import preprocess_fundus_image, crop_fundus_circle


def test_crop_fundus_circle():
    # Create synthetic 100x100 black image with a central white circle
    synthetic = np.zeros((100, 100, 3), dtype=np.uint8)
    synthetic[25:75, 25:75, :] = 200

    cropped = crop_fundus_circle(synthetic, tol=10)
    assert cropped.shape[0] == 50
    assert cropped.shape[1] == 50


def test_preprocess_fundus_image_tensor_shape():
    # Create synthetic 300x300 RGB image
    dummy_img = np.random.randint(20, 240, (300, 300, 3), dtype=np.uint8)

    tensor, processed_rgb = preprocess_fundus_image(dummy_img, target_size=(224, 224))

    assert tensor.shape == (1, 3, 224, 224)
    assert processed_rgb.shape == (224, 224, 3)
    assert tensor.dtype == pytest.importorskip("torch").float32
