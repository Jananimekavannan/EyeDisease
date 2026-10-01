"""
Retinal Image Augmentations & Preprocessing Pipeline.
Includes Ben Graham's method (circular crop + local color constancy via Gaussian blur subtraction)
and Albumentations-based data augmentation for fundus images.
"""
import cv2
import numpy as np


def crop_image_from_gray(img: np.ndarray, tol: int = 7) -> np.ndarray:
    """
    Crops out the black unexposed borders of a retinal fundus photograph.
    """
    if img.ndim == 2:
        mask = img > tol
        return img[np.ix_(mask.any(1), mask.any(0))]
    elif img.ndim == 3:
        gray_img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        mask = gray_img > tol
        check_shape = img[:, :, 0][np.ix_(mask.any(1), mask.any(0))].shape[0]
        if check_shape == 0:
            # Mask is too dark or empty, return original image
            return img
        else:
            img1 = img[:, :, 0][np.ix_(mask.any(1), mask.any(0))]
            img2 = img[:, :, 1][np.ix_(mask.any(1), mask.any(0))]
            img3 = img[:, :, 2][np.ix_(mask.any(1), mask.any(0))]
            img = np.stack([img1, img2, img3], axis=-1)
        return img


def ben_graham_preprocessing(img: np.ndarray, sigmaX: int = 10, img_size: int = 224) -> np.ndarray:
    """
    Applies Ben Graham's winning Kaggle preprocessing technique:
    1. Circular crop black borders
    2. Resize to square dimension
    3. Blend image with Gaussian Blur to normalize illumination across different cameras
    """
    img = crop_image_from_gray(img)
    img = cv2.resize(img, (img_size, img_size))
    # Gaussian blur subtraction for color constancy
    blurred = cv2.GaussianBlur(img, (0, 0), sigmaX)
    enhanced = cv2.addWeighted(img, 4, blurred, -4, 128)
    return enhanced


def get_train_transforms(img_size: int = 224):
    """
    Returns albumentations Compose object for training data augmentation.
    """
    try:
        import albumentations as A
        from albumentations.pytorch import ToTensorV2

        return A.Compose([
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.5),
            A.RandomRotate90(p=0.5),
            A.ShiftScaleRotate(shift_limit=0.0625, scale_limit=0.1, rotate_limit=45, p=0.5),
            A.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1, hue=0.05, p=0.4),
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
            ToTensorV2()
        ])
    except ImportError:
        # Fallback if albumentations is not installed yet
        return None


def get_valid_transforms(img_size: int = 224):
    """
    Returns validation transformations (only normalization and tensor conversion).
    """
    try:
        import albumentations as A
        from albumentations.pytorch import ToTensorV2

        return A.Compose([
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
            ToTensorV2()
        ])
    except ImportError:
        return None
