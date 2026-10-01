# Member 2 - Final Grad-CAM Report
## Frozen production model
- Checkpoint: `/content/gdrive/MyDrive/SIH26038/FINAL/efficientnet_b0_aptos.pth`
- SHA-256: `6c342eb3bf432fce8a078e55a9027a4c107bdaabe1e55c23d2c8070b3bd7c24a`
- SHA verification: **PASS**
- Architecture: `efficientnet_b0`
- Model outputs: `4`
- Device: `cpu`
- Precision: FP32 / eval
## Production preprocessing
- Exact source: `/content/gdrive/MyDrive/SIH26038/FINAL/dr_infer.py` (dr_infer.crop_pad_512 (imported))
- `crop_pad_512`, resize to `224x224` (interpolation: not detected -> cv2 default INTER_LINEAR), RGB, /255, ImageNet normalization
## Calibration
- Temperature: `2.0687387852231383`
- Referable threshold: `0.29`
- Referable definition: `P(Grade 2-4) >= threshold`
## Grad-CAM target
- Actual last Conv2d: `conv_head`
- Expected layer: `conv_head`
- Layer match: **PASS**
- Raw ordinal output index for P(Y>=2): `1`
- Grad-CAM target: **calibrated P(Grade 2-4)** (production softmax(log_probs/T); clamp bypassed in backward only)
## Verification
- Target-index verification: **PASS** (monotone=True, raw-output AUCs vs grade>=2 = [0.968, 0.992, 0.974, 0.963], best index=1)
- Official FP32 log-prob cross-check (info): `{'status': 'MISMATCH', 'n': 20, 'max_abs_logprob_diff': 3.94702, 'argmax_agreement': '18/20'}`
- Gradient flow: **PASS**
- Determinism: **PASS** (max |d out|=0.00e+00, max |d cam|=0.00e+00)
- Heatmap alignment: **PASS** (mean CAM mass inside fundus = 0.48)
- Faithfulness (top-20% deletion beats random): `6/15`
- Real APTOS examples: `15` (categories: FAIL_FN, FAIL_FP, GRADE0, GRADE1, GRADE2, GRADE3, GRADE4, UNCERTAIN)
## Outputs
- `overlays/*.png`, `results.csv`, `report.json`, `MEMBER2_GRADCAM_REPORT.md`
## Remaining issues
- Could not detect dr_infer.py resize interpolation; check the official cross-check result.
- Official FP32 log-prob cross-check mismatch: {'status': 'MISMATCH', 'n': 20, 'max_abs_logprob_diff': 3.94702, 'argmax_agreement': '18/20'}. Preprocessing or image order may differ from Member 1.
- Only 48% of Grad-CAM mass lies inside the fundus disc.
- Weak faithfulness sanity (6/15); Grad-CAM at 7x7 is coarse.

Overlays are drawn on the crop_pad_512 (model-view) image.
**Grad-CAM is an interpretability visualization only. It is not lesion detection, segmentation, or clinical proof. `lesion_status=unavailable`.**
