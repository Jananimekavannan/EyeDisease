# 📓 Google Colab & Jupyter Notebooks

This folder contains experiment notebooks designed to be run in **Google Colab** with GPU acceleration (NVIDIA T4, V100, or A100).

---

## 🚀 Recommended Workflow for Member 1

1. **Open Google Colab**:
   - Create a new Colab notebook or upload the pipeline script from `ml/training/`.
   - Set runtime to **GPU**: `Runtime > Change runtime type > T4 GPU`.

2. **Mount Google Drive or Kaggle API**:
   ```python
   # Authenticate with Kaggle API
   !pip install -q kaggle
   from google.colab import files
   files.upload() # Upload kaggle.json
   !mkdir -p ~/.kaggle && cp kaggle.json ~/.kaggle/ && chmod 600 ~/.kaggle/kaggle.json
   !kaggle competitions download -c aptos2019-blindness-detection
   !unzip -q aptos2019-blindness-detection.zip -d ./aptos2019
   ```

3. **Train EfficientNet-B0**:
   - Run training using `ml/training/train.py` logic.
   - Initial candidate model: `timm.create_model('efficientnet_b0', pretrained=True, num_classes=5)`.
   - Save the best model based on validation Quadratic Weighted Kappa (QWK) and macro F1 score.

4. **Export Weights**:
   ```python
   torch.save(best_model.state_dict(), 'efficientnet_b0_aptos.pth')
   from google.colab import files
   files.download('efficientnet_b0_aptos.pth')
   ```

5. **Place in Repository**:
   - Save the downloaded weights file to: `SIH26038-DR-Screening/ml/weights/efficientnet_b0_aptos.pth`.
   - The FastAPI backend will automatically discover and load this file.
