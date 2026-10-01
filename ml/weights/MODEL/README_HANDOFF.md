# SIH26038 - DR grading model (Member 1 handoff)

Research prototype on APTOS 2019. Not a clinical device; thresholds are prototype engineering thresholds.

## Model
- timm EfficientNet-B0, ordinal head with 4 cumulative outputs ('grade > k'), drop_rate 0.3, 224x224
- checkpoint: efficientnet_b0_aptos.pth (load with weights_only=True); NOT a 5-class softmax head
- preprocessing (see preprocessing_config.json, code in dr_infer.py): black-border crop, pad square, resize 512 (INTER_AREA),
  BGR->RGB, resize 224 (INTER_AREA), /255, ImageNet mean/std. No Ben Graham / CLAHE.
- inference: FP32. Calibration: temperature 2.0687, referable threshold P(grade 2-4) >= 0.29 (fitted on FP32 validation only)

## Use (FastAPI)
```python
from dr_infer import DRPredictor
import cv2
P = DRPredictor("efficientnet_b0_aptos.pth", "calibration.json")
r = P.predict_bgr(cv2.imread("fundus.png"))  # grade, probs, confidence, p_referable, referable
```
- `grade` (argmax) and `referable` (threshold on p_referable) are SEPARATE outputs and can disagree (e.g. Mild + referable). Show both; do not treat it as a bug.

## Official held-out test results (APTOS grouped split, n=513, FP32)
- accuracy 0.797 | balanced acc 0.619 | macro F1 0.611 | QWK 0.886 | ECE 0.048 | NLL 0.555
- referable DR (grades 2-4): sensitivity 0.954 (188/197) | specificity 0.911 (288/316) | precision 0.870 | NPV 0.970 | F1 0.910 | ROC-AUC 0.977 | PR-AUC 0.959

| grade | n | precision | recall |
|---|---|---|---|
| 0 No DR | 259 | 0.977 | 0.985 (255) |
| 1 Mild | 57 | 0.596 | 0.596 (34) |
| 2 Moderate | 142 | 0.715 | 0.690 (98) |
| 3 Severe | 20 | 0.265 | 0.450 (9) |
| 4 Proliferative | 35 | 0.542 | 0.371 (13) |

## Known limitations
- Severe (9/20) and Proliferative (13/35) recall are weak with wide intervals; the model is not reliable for advanced disease.
- APTOS only, no external validation; calibration may not transfer to other cameras/populations. No patient IDs, so patient-level separation is not claimed.
- 79 rows with conflicting duplicate labels were kept in training only. Split is ~72/14/14 (not 80/10/10), grouped and near-duplicate safe.
- Raw-image crop verified on PNG only; JPEG uploads not tested. Original 82.56% model could not be audited (no checkpoint/code).

## For Grad-CAM (Member 2)
- use DRPredictor(...).model in eval mode, FP32. Candidate target layer: model.bn2 (compare with model.conv_head); both untested.
- explain raw output column 1 of the 4 outputs ('grade > 1', referable). Map heatmaps onto the 512 padded image, not the raw image.
- do not describe Grad-CAM as a lesion detector.