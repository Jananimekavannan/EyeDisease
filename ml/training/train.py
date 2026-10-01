"""
Model Training Script for Diabetic Retinopathy Classification.
Initial Candidate Model: EfficientNet-B0 (PyTorch / timm).
Designed for execution on Google Colab or local GPU workstation.

NOTE: This script produces the trained weights that will be saved to `ml/weights/efficientnet_b0_aptos.pth`.
"""
import os
import argparse
from pathlib import Path
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.model_selection import train_test_split
from sklearn.metrics import cohen_kappa_score
import pandas as pd
import numpy as np

from ml.training.config import default_config, TrainingConfig
from ml.training.dataset import FundusDRDataset
from ml.training.augmentations import get_train_transforms, get_valid_transforms
from ml.models.model_factory import create_dr_model


def train_one_epoch(model, dataloader, criterion, optimizer, scaler, device):
    model.train()
    running_loss = 0.0
    all_preds = []
    all_targets = []

    for images, targets in dataloader:
        images = images.to(device)
        targets = targets.to(device)

        optimizer.zero_grad()

        with torch.cuda.amp.autocast(enabled=(device == "cuda")):
            outputs = model(images)
            loss = criterion(outputs, targets)

        if scaler is not None and device == "cuda":
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            loss.backward()
            optimizer.step()

        running_loss += loss.item() * images.size(0)
        preds = torch.argmax(outputs, dim=1).detach().cpu().numpy()
        all_preds.extend(preds)
        all_targets.extend(targets.cpu().numpy())

    epoch_loss = running_loss / len(dataloader.dataset)
    epoch_qwk = cohen_kappa_score(all_targets, all_preds, weights="quadratic")
    return epoch_loss, epoch_qwk


def validate(model, dataloader, criterion, device):
    model.eval()
    running_loss = 0.0
    all_preds = []
    all_targets = []

    with torch.no_grad():
        for images, targets in dataloader:
            images = images.to(device)
            targets = targets.to(device)

            outputs = model(images)
            loss = criterion(outputs, targets)

            running_loss += loss.item() * images.size(0)
            preds = torch.argmax(outputs, dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_targets.extend(targets.cpu().numpy())

    val_loss = running_loss / len(dataloader.dataset)
    val_qwk = cohen_kappa_score(all_targets, all_preds, weights="quadratic")
    return val_loss, val_qwk, all_preds, all_targets


def main():
    parser = argparse.ArgumentParser(description="Train EfficientNet-B0 on APTOS 2019")
    parser.add_argument("--epochs", type=int, default=default_config.num_epochs)
    parser.add_argument("--batch-size", type=int, default=default_config.batch_size)
    parser.add_argument("--lr", type=float, default=default_config.learning_rate)
    args = parser.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[*] Training on device: {device}")

    # Check if dataset files exist
    csv_path = default_config.data_dir / default_config.train_csv
    img_dir = default_config.data_dir / default_config.train_images_dir

    if not csv_path.exists():
        print(f"[!] Dataset CSV not found at {csv_path}.")
        print("[!] Please download the APTOS 2019 dataset into ml/data/aptos2019 as described in ml/data/README.md")
        return

    df = pd.read_csv(csv_path)
    train_df, val_df = train_test_split(df, test_size=0.15, stratify=df["diagnosis"], random_state=42)

    train_dataset = FundusDRDataset(
        train_df,
        img_dir,
        img_size=default_config.img_size,
        transforms=get_train_transforms(default_config.img_size)
    )
    val_dataset = FundusDRDataset(
        val_df,
        img_dir,
        img_size=default_config.img_size,
        transforms=get_valid_transforms(default_config.img_size)
    )

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=2)

    model = create_dr_model(
        model_name=default_config.model_name,
        num_classes=default_config.num_classes,
        pretrained=default_config.pretrained,
        drop_rate=default_config.dropout_rate
    ).to(device)
    criterion = nn.CrossEntropyLoss(label_smoothing=default_config.label_smoothing)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=default_config.weight_decay)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=default_config.min_lr)
    scaler = torch.cuda.amp.GradScaler() if device == "cuda" else None

    best_qwk = -1.0
    output_dir = default_config.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    best_weight_path = output_dir / default_config.checkpoint_name

    print(f"[*] Commencing training: {args.epochs} epochs with initial candidate {default_config.model_name}...")
    for epoch in range(args.epochs):
        train_loss, train_qwk = train_one_epoch(model, train_loader, criterion, optimizer, scaler, device)
        val_loss, val_qwk, _, _ = validate(model, val_loader, criterion, device)
        scheduler.step()

        print(f"Epoch [{epoch+1}/{args.epochs}] | Train Loss: {train_loss:.4f} QWK: {train_qwk:.4f} | Val Loss: {val_loss:.4f} QWK: {val_qwk:.4f}")

        if val_qwk > best_qwk:
            best_qwk = val_qwk
            torch.save(model.state_dict(), best_weight_path)
            print(f"  [+] Saved new best model checkpoint to {best_weight_path} (Val QWK: {val_qwk:.4f})")

    print(f"[*] Training complete. Best Validation QWK: {best_qwk:.4f}")


if __name__ == "__main__":
    main()
