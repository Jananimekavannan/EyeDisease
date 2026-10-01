# ⚖️ Reliability & Decision Engine

In medical screening for Diabetic Retinopathy in rural populations, silent failure is unacceptable. A deep learning model that makes an overconfident mistake can lead to preventable blindness.

The **Reliability & Decision Engine** establishes a safety net:
- It computes uncertainty metrics (Shannon entropy, margin of confidence).
- It verifies consistency across the classification output and localized lesion evidence (evidence fusion).
- It categorizes screening outcomes into **Reliable** (automated screening report) or **Uncertain** (routed for expert human ophthalmologist review).

---

## 🧩 Components

1. **`confidence.py`**:
   - Softmax entropy calculation.
   - Prediction margin (difference between top-1 and top-2 class probabilities).
   - Temperature scaling calibration hook.

2. **`evidence_fusion.py`**:
   - Checks logical agreement between DR severity grade and detected lesions.
   - For example: if the model predicts Grade 0 (No DR) but U-Net detects numerous hemorrhages, an evidence conflict is triggered.

3. **`decision_engine.py`**:
   - Core triage engine:
     - `RELIABLE`: Confidence high, quality high, evidence consistent → direct screening result.
     - `HUMAN_REVIEW_RECOMMENDED`: Borderline confidence or lesion-grade discrepancy → asynchronous tele-ophthalmology queue.
     - `RECAPTURE_REQUIRED`: Failed image quality gate.
