"""
Training Configuration for SIH26038 Diabetic Retinopathy Classification.
Defines hyperparameters, candidate architectures, and dataset filepaths.
"""
from dataclasses import dataclass
from pathlib import Path


@dataclass
class TrainingConfig:
    # Model Architecture
    # NOTE: EfficientNet-B0 is our initial candidate model and must be evaluated against benchmarks
    model_name: str = "efficientnet_b0"
    num_classes: int = 5
    pretrained: bool = True
    dropout_rate: float = 0.3

    # Image Dimensions
    img_size: int = 224  # Standard EfficientNet-B0 resolution (can test 256 / 288)

    # Optimization Hyperparameters
    batch_size: int = 32
    num_epochs: int = 25
    learning_rate: float = 3e-4
    min_lr: float = 1e-6
    weight_decay: float = 1e-4

    # Loss Function & Regularization
    # Options: 'cross_entropy', 'focal_loss', 'smooth_l1' (for ordinal regression)
    loss_function: str = "cross_entropy"
    label_smoothing: float = 0.05

    # Data Paths (Set locally or mapped in Google Colab)
    data_dir: Path = Path("ml/data/aptos2019")
    train_csv: str = "train.csv"
    train_images_dir: str = "train_images"

    # Export Path
    output_dir: Path = Path("ml/weights")
    checkpoint_name: str = "efficientnet_b0_aptos.pth"

    # Hardware & Precision
    device: str = "cuda"  # fallback to 'cpu' if unavailable
    num_workers: int = 4
    mixed_precision: bool = True
    seed: int = 42


# Global configuration instance
default_config = TrainingConfig()
