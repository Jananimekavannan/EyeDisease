"""
PyTorch Dataset for IDRiD Lesion Segmentation.
Loads retinal fundus images alongside multi-class ground-truth masks:
(Microaneurysms, Haemorrhages, Hard Exudates, Soft Exudates).
"""
from pathlib import Path
from typing import Optional, Callable, Dict
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset


class IDRiDLesionDataset(Dataset):
    """
    Dataset loader for IDRiD lesion segmentation challenge.
    """

    LESION_CLASSES = ["microaneurysms", "haemorrhages", "hard_exudates", "soft_exudates"]

    def __init__(
        self,
        image_dir: Path,
        mask_dirs: Dict[str, Path],
        img_size: int = 512,
        transforms: Optional[Callable] = None
    ):
        self.image_dir = Path(image_dir)
        self.mask_dirs = {k: Path(v) for k, v in mask_dirs.items()}
        self.img_size = img_size
        self.transforms = transforms
        self.image_files = sorted(list(self.image_dir.glob("*.jpg")) + list(self.image_dir.glob("*.tif")))

    def __len__(self) -> int:
        return len(self.image_files)

    def __getitem__(self, idx: int):
        img_path = self.image_files[idx]
        image_id = img_path.stem

        image = cv2.imread(str(img_path))
        if image is None:
            raise FileNotFoundError(f"Failed to read image: {img_path}")
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (self.img_size, self.img_size))

        masks = []
        for lesion_name in self.LESION_CLASSES:
            mask_dir = self.mask_dirs.get(lesion_name)
            mask_path = mask_dir / f"{image_id}_{lesion_name[:2].upper()}.tif" if mask_dir else None

            if mask_path and mask_path.exists():
                mask = cv2.imread(str(mask_path), cv2.IMREAD_GRAYSCALE)
                mask = cv2.resize(mask, (self.img_size, self.img_size), interpolation=cv2.INTER_NEAREST)
                mask = (mask > 127).astype(np.float32)
            else:
                mask = np.zeros((self.img_size, self.img_size), dtype=np.float32)
            masks.append(mask)

        multi_mask = np.stack(masks, axis=-1)  # [H, W, 4]

        image_tensor = torch.tensor(image.transpose(2, 0, 1), dtype=torch.float32) / 255.0
        mask_tensor = torch.tensor(multi_mask.transpose(2, 0, 1), dtype=torch.float32)

        return image_tensor, mask_tensor
