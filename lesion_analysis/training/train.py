"""
U-Net Training Script for IDRiD Retinal Lesion Segmentation (Member 2).
Trains multi-channel binary segmentation network for microaneurysms, hemorrhages, and exudates.
"""
from pathlib import Path
import torch
import torch.nn as nn
from torch.utils.data import DataLoader


class DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.conv(x)


class UNet(nn.Module):
    """
    Standard U-Net architecture for multi-lesion retinal segmentation.
    """

    def __init__(self, in_channels: int = 3, out_channels: int = 4, features=(32, 64, 128, 256)):
        super().__init__()
        self.downs = nn.ModuleList()
        self.ups = nn.ModuleList()
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

        # Encoder
        for feature in features:
            self.downs.append(DoubleConv(in_channels, feature))
            in_channels = feature

        # Bottleneck
        self.bottleneck = DoubleConv(features[-1], features[-1] * 2)

        # Decoder
        for feature in reversed(features):
            self.ups.append(nn.ConvTranspose2d(feature * 2, feature, kernel_size=2, stride=2))
            self.ups.append(DoubleConv(feature * 2, feature))

        self.final_conv = nn.Conv2d(features[0], out_channels, kernel_size=1)

    def forward(self, x):
        skip_connections = []
        for down in self.downs:
            x = down(x)
            skip_connections.append(x)
            x = self.pool(x)

        x = self.bottleneck(x)
        skip_connections = skip_connections[::-1]

        for idx in range(0, len(self.ups), 2):
            x = self.ups[idx](x)
            skip_connection = skip_connections[idx // 2]
            concat_skip = torch.cat((skip_connection, x), dim=1)
            x = self.ups[idx + 1](concat_skip)

        return self.final_conv(x)


class DiceBCELoss(nn.Module):
    """
    Combined Binary Cross Entropy + Dice Loss for handling imbalanced retinal lesion segmentation.
    """

    def __init__(self, bce_weight: float = 0.5):
        super().__init__()
        self.bce = nn.BCEWithLogitsLoss()
        self.bce_weight = bce_weight

    def forward(self, inputs, targets, smooth: float = 1e-6):
        bce_loss = self.bce(inputs, targets)

        inputs = torch.sigmoid(inputs)
        inputs = inputs.view(-1)
        targets = targets.view(-1)

        intersection = (inputs * targets).sum()
        dice_loss = 1 - (2.0 * intersection + smooth) / (inputs.sum() + targets.sum() + smooth)

        return self.bce_weight * bce_loss + (1 - self.bce_weight) * dice_loss


def train_lesion_model():
    print("[*] IDRiD U-Net Lesion Segmentation Training Pipeline.")
    print("[*] Architecture: U-Net (3 in_channels -> 4 lesion out_channels)")
    print("[*] To train, download IDRiD segmentation challenge masks into ml/data/idrid/")


if __name__ == "__main__":
    train_lesion_model()
