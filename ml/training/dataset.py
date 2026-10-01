"""
PyTorch Dataset class for Diabetic Retinopathy Fundus Images (e.g., APTOS 2019).
Handles CSV parsing, image loading, Ben Graham preprocessing, and albumentations augmentations.
"""
from pathlib import Path
from typing import Optional, Callable
import cv2
import pandas as pd
import torch
from torch.utils.data import Dataset

from ml.training.augmentations import ben_graham_preprocessing


class FundusDRDataset(Dataset):
    """
    Dataset loader for APTOS 2019 and similar DR screening datasets.
    """

    def __init__(
        self,
        df: pd.DataFrame,
        image_dir: Path,
        img_size: int = 224,
        transforms: Optional[Callable] = None,
        is_test: bool = False,
        apply_ben_graham: bool = True
    ):
        self.df = df.reset_index(drop=True)
        self.image_dir = Path(image_dir)
        self.img_size = img_size
        self.transforms = transforms
        self.is_test = is_test
        self.apply_ben_graham = apply_ben_graham

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int):
        row = self.df.iloc[idx]
        image_id = row["id_code"]

        # Support filenames with or without .png extension
        img_path = self.image_dir / f"{image_id}.png"
        if not img_path.exists():
            img_path = self.image_dir / f"{image_id}.jpg"
        if not img_path.exists():
            img_path = self.image_dir / f"{image_id}"

        # Load RGB image via OpenCV
        image = cv2.imread(str(img_path))
        if image is None:
            raise FileNotFoundError(f"Fundus image could not be loaded from path: {img_path}")
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Apply Ben Graham circular mask & local color constancy
        if self.apply_ben_graham:
            image = ben_graham_preprocessing(image, sigmaX=10, img_size=self.img_size)
        else:
            image = cv2.resize(image, (self.img_size, self.img_size))

        # Apply Albumentations or PyTorch transforms
        if self.transforms:
            augmented = self.transforms(image=image)
            image_tensor = augmented["image"]
        else:
            # Default fallback to float tensor normalized to [0, 1]
            image_tensor = torch.tensor(image.transpose(2, 0, 1), dtype=torch.float32) / 255.0

        if self.is_test:
            return image_tensor, image_id

        label = torch.tensor(row["diagnosis"], dtype=torch.long)
        return image_tensor, label
