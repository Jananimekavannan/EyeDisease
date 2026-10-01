# ⚖️ Model Weights Directory

> **NOTICE:** Trained weights files (`*.pth`, `*.pt`, `*.onnx`) are git-ignored and should **NEVER** be committed to Git.

---

## 🎯 Target Weight File
- **Target Filename**: `efficientnet_b0_aptos.pth`
- **Expected Architecture**: EfficientNet-B0 (PyTorch / timm)
- **Output Classes**: 5 (0: No DR, 1: Mild, 2: Moderate, 3: Severe, 4: Proliferative)
- **Input Dimensions**: 3 x 224 x 224 (or 3 x 256 x 256 depending on config)

---

## 🔄 Status & Fallback Behavior
- **Current State**: Model training pending on Google Colab (Member 1).
- **Backend Behavior**:
  - The inference engine checks if `efficientnet_b0_aptos.pth` exists in this folder.
  - If **present**, the real trained weights are loaded into `model.load_state_dict()`.
  - If **absent**, the system returns a clearly marked fallback message indicating that model weights are pending, rather than returning fake predictions or fake accuracy.
