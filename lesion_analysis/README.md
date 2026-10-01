# 🔬 Lesion Analysis Module (Member 2)

This module focuses on localized segmentation and quantification of Diabetic Retinopathy retinal lesions using the **IDRiD (Indian Diabetic Retinopathy Image Dataset)** benchmark.

---

## 🎯 Clinical Lesion Targets

1. **Microaneurysms (MAs)**: Tiny red dots representing local capillary dilations; primary marker of Mild NPDR (Grade 1).
2. **Haemorrhages (HAs)**: Blot and flame-shaped red patches caused by broken capillaries; characteristic of Moderate & Severe NPDR (Grade 2-3).
3. **Hard Exudates (EXs)**: Waxy yellow lipid deposits with sharp borders indicating chronic vascular permeability.
4. **Soft Exudates (Cotton Wool Spots / SEs)**: Fluffy white ischemic lesions indicating nerve fiber micro-infarctions.

---

## 🏗️ Architecture: U-Net
- **Backbone**: EfficientNet or ResNet encoder with feature skip-connections to decoder.
- **Output Channels**: 4 binary segmentation masks (one per lesion type).
- **Loss Function**: Combined BCE (Binary Cross-Entropy) + Dice Loss to handle extreme class imbalance.

---

## 📁 Structure
- `training/dataset.py`: PyTorch loader pairing IDRiD fundus images with multi-lesion binary masks.
- `training/train.py`: PyTorch training script with Dice coefficient tracking.
- `inference/lesion_detector.py`: Production lesion quantification service calculating lesion count, area percentage, and bounding boxes.
