"""
Model Evaluation and Benchmark Verification Script.
Computes Quadratic Weighted Kappa (QWK), Sensitivity, Specificity, Confusion Matrix,
and Per-Class Performance on APTOS or Messidor-2 validation test splits.
"""
from pathlib import Path
import torch
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, cohen_kappa_score
from torch.utils.data import DataLoader

from ml.training.config import default_config
from ml.training.dataset import FundusDRDataset
from ml.models.model_factory import create_dr_model

DR_CLASSES = [
    "0 - No DR",
    "1 - Mild NPDR",
    "2 - Moderate NPDR",
    "3 - Severe NPDR",
    "4 - Proliferative DR"
]


def evaluate_checkpoint(checkpoint_path: Path, test_csv: Path, image_dir: Path):
    """
    Evaluates a saved PyTorch checkpoint against test dataset annotations.
    """
    if not checkpoint_path.exists():
        print(f"[!] Checkpoint not found at: {checkpoint_path}")
        print("[!] Train the model first using train.py or Colab and place weights in ml/weights/")
        return None

    if not test_csv.exists() or not image_dir.exists():
        print(f"[!] Validation data not found at: {test_csv} or {image_dir}")
        return None

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[*] Loading model from {checkpoint_path} on {device}...")

    model = create_model(model_name=default_config.model_name, num_classes=5, pretrained=False)
    state_dict = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    df = pd.read_csv(test_csv)
    dataset = FundusDRDataset(
        df,
        image_dir,
        img_size=default_config.img_size,
        transforms=get_valid_transforms(default_config.img_size),
        apply_ben_graham=True
    )
    dataloader = DataLoader(dataset, batch_size=32, shuffle=False)

    all_preds = []
    all_targets = []
    all_probs = []

    with torch.no_grad():
        for images, targets in dataloader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1).cpu().numpy()
            preds = np.argmax(probs, axis=1)

            all_preds.extend(preds)
            all_targets.extend(targets.numpy())
            all_probs.extend(probs)

    qwk = cohen_kappa_score(all_targets, all_preds, weights="quadratic")
    print(f"\n================ MODEL EVALUATION REPORT ================")
    print(f"Candidate Architecture: {default_config.model_name}")
    print(f"Quadratic Weighted Kappa (QWK): {qwk:.4f}")
    print("\nClassification Report:")
    print(classification_report(all_targets, all_preds, target_names=DR_CLASSES, digits=4))
    print("Confusion Matrix:")
    print(confusion_matrix(all_targets, all_preds))

    return {
        "qwk": qwk,
        "confusion_matrix": confusion_matrix(all_targets, all_preds).tolist()
    }


if __name__ == "__main__":
    weights_path = default_config.output_dir / default_config.checkpoint_name
    test_csv = default_config.data_dir / "val.csv"
    img_dir = default_config.data_dir / "train_images"
    evaluate_checkpoint(weights_path, test_csv, img_dir)
