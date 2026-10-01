# 🛡️ Image Quality Gate

In rural community screening camps, non-mydriatic fundus cameras are frequently operated by community health workers (ASHA/ANM workers). Retinal images may suffer from:
1. Patient eye movement or camera defocus (Motion / optical blur).
2. Poor pupil dilation or glare (Under-exposure or over-exposure).
3. Eyelash / eyelid occlusions (Incomplete field of view).

The **Image Quality Gate** automatically inspects fundus images *before* they are sent to the deep learning models. If an image is deemed ungradable, the operator is prompted immediately to re-capture the image.

---

## 📐 Metrics & Heuristics

1. **Blur Detection (`blur_detection.py`)**:
   - Variance of the Laplacian (`cv2.Laplacian`): measures high-frequency edge sharpness.
   - Modified Laplacian (LAPM) and fast Fourier Transform (FFT) spectral energy.

2. **Illumination Assessment (`illumination.py`)**:
   - Mean luminance and entropy across the retinal field of view.
   - Fraction of saturated (overexposed > 250) and clipped (underexposed < 15) pixels.
   - Local contrast index using standard deviation of luminance.

3. **Master Quality Evaluator (`quality_check.py`)**:
   - Synthesizes metrics into a pass/fail/borderline verdict with actionable feedback for the camera technician.
