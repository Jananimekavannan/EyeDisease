"""
Temperature Scaling & Calibration Evaluation Module.
Provides post-hoc probability calibration for Diabetic Retinopathy classification,
along with ECE (Expected Calibration Error), Brier Score, and NLL metric calculations.

Research Basis:
Temperature Scaling (Guo et al., 2017) optimizes a scalar T > 0 on validation set logits
by minimizing Negative Log-Likelihood (NLL). Because softmax(z / T) is a monotonic transformation
of logits, T scaling strictly preserves argmax predicted classes, accuracy, and macro F1,
while significantly reducing Expected Calibration Error (ECE) and Brier Score.
"""
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import json
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
try:
    from sklearn.metrics import log_loss, f1_score, accuracy_score
    SKLEARN_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    SKLEARN_AVAILABLE = False
    log_loss = f1_score = accuracy_score = None


def compute_ece(probs: np.ndarray, labels: np.ndarray, n_bins: int = 10) -> float:
    """
    Computes Expected Calibration Error (ECE).
    """
    confidences = np.max(probs, axis=1)
    predictions = np.argmax(probs, axis=1)
    accuracies = (predictions == labels).astype(float)

    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    ece = 0.0

    for i in range(n_bins):
        bin_lower, bin_upper = bin_boundaries[i], bin_boundaries[i + 1]
        in_bin = (confidences > bin_lower) & (confidences <= bin_upper)
        prop_in_bin = np.mean(in_bin)

        if prop_in_bin > 0:
            accuracy_in_bin = np.mean(accuracies[in_bin])
            avg_confidence_in_bin = np.mean(confidences[in_bin])
            ece += np.abs(accuracy_in_bin - avg_confidence_in_bin) * prop_in_bin

    return float(ece)


def compute_brier_score(probs: np.ndarray, labels: np.ndarray, num_classes: int = 5) -> float:
    """
    Computes multi-class Brier score: BS = (1/N) * sum_i sum_k (p_ik - y_ik)^2.
    """
    one_hot = np.eye(num_classes)[labels]
    return float(np.mean(np.sum((probs - one_hot) ** 2, axis=1)))


class TemperatureScaler:
    """
    Temperature Scaling probability calibrator.
    Optimizes scalar T > 0 on validation logits using NLL loss.
    """

    def __init__(self, temperature: float = 2.07):
        self.temperature = max(float(temperature), 0.01)

    def calibrate_logits(self, logits: torch.Tensor) -> torch.Tensor:
        return logits / self.temperature

    def calibrate_probabilities_from_logits(self, logits: torch.Tensor) -> np.ndarray:
        scaled_logits = self.calibrate_logits(logits)
        probs = torch.softmax(scaled_logits, dim=-1)
        return probs.detach().cpu().numpy()

    def calibrate_probabilities_from_raw(self, raw_probs: np.ndarray) -> np.ndarray:
        eps = 1e-7
        clipped = np.clip(raw_probs, eps, 1.0 - eps)
        log_probs = np.log(clipped)
        scaled_log_probs = log_probs / self.temperature
        exp_scaled = np.exp(scaled_log_probs - np.max(scaled_log_probs, axis=-1, keepdims=True))
        return exp_scaled / np.sum(exp_scaled, axis=-1, keepdims=True)

    def fit_on_validation_logits(
        self,
        val_logits: torch.Tensor,
        val_labels: torch.Tensor,
        max_iter: int = 50,
        lr: float = 0.01
    ) -> float:
        """
        Fits temperature scalar T ONLY on validation set logits & labels via NLL minimization.
        """
        device = val_logits.device
        temp_param = nn.Parameter(torch.ones(1, device=device) * 1.5)
        criterion = nn.CrossEntropyLoss()

        optimizer = optim.LBFGS([temp_param], lr=lr, max_iter=max_iter)

        def eval_loss():
            optimizer.zero_grad()
            loss = criterion(val_logits / temp_param, val_labels)
            loss.backward()
            return loss

        optimizer.step(eval_loss)
        self.temperature = max(float(temp_param.item()), 0.01)
        return self.temperature

    def save_config(self, save_path: Path):
        save_path = Path(save_path)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        with open(save_path, "w") as f:
            json.dump({"temperature": self.temperature}, f, indent=2)

    def load_config(self, load_path: Path) -> bool:
        load_path = Path(load_path)
        if load_path.exists():
            with open(load_path, "r") as f:
                data = json.load(f)
                self.temperature = max(float(data.get("temperature", 1.0)), 0.01)
            return True
        return False


def evaluate_calibration_performance(
    logits: torch.Tensor,
    labels: torch.Tensor,
    scaler: TemperatureScaler
) -> Dict[str, Any]:
    """
    Evaluates raw vs calibrated performance metrics on a dataset split.
    """
    device = logits.device
    labels_np = labels.cpu().numpy()

    # Raw metrics
    raw_probs = torch.softmax(logits, dim=-1).cpu().numpy()
    raw_preds = np.argmax(raw_probs, axis=1)

    raw_nll = float(log_loss(labels_np, raw_probs, labels=list(range(5))))
    raw_ece = compute_ece(raw_probs, labels_np)
    raw_brier = compute_brier_score(raw_probs, labels_np)
    raw_acc = float(accuracy_score(labels_np, raw_preds))
    raw_f1 = float(f1_score(labels_np, raw_preds, average="macro"))

    # Calibrated metrics
    calibrated_probs = scaler.calibrate_probabilities_from_logits(logits)
    calibrated_preds = np.argmax(calibrated_probs, axis=1)

    calibrated_nll = float(log_loss(labels_np, calibrated_probs, labels=list(range(5))))
    calibrated_ece = compute_ece(calibrated_probs, labels_np)
    calibrated_brier = compute_brier_score(calibrated_probs, labels_np)
    calibrated_acc = float(accuracy_score(labels_np, calibrated_preds))
    calibrated_f1 = float(f1_score(labels_np, calibrated_preds, average="macro"))

    return {
        "fitted_temperature": scaler.temperature,
        "raw_nll": round(raw_nll, 4),
        "calibrated_nll": round(calibrated_nll, 4),
        "raw_ece": round(raw_ece, 4),
        "calibrated_ece": round(calibrated_ece, 4),
        "raw_brier": round(raw_brier, 4),
        "calibrated_brier": round(calibrated_brier, 4),
        "raw_accuracy": round(raw_acc, 4),
        "calibrated_accuracy": round(calibrated_acc, 4),
        "raw_macro_f1": round(raw_f1, 4),
        "calibrated_macro_f1": round(calibrated_f1, 4)
    }


default_scaler = TemperatureScaler(temperature=2.0687387852231383)
