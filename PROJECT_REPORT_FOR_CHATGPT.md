# 📋 COMPREHENSIVE PROJECT REPORT & ARCHITECTURE HANDOVER
## SIH26038: Explainable AI for Diabetic Retinopathy Screening in Rural India

> **⚠️ NOTE FOR CHATGPT / DEVELOPERS / COLLABORATORS:**
> This repository represents the consolidated **SIH26038 Medical AI Platform**.
> - **Frontend:** React + TypeScript + Vite + Tailwind CSS in `client/` (Dev Port `5173`)
> - **Backend:** FastAPI REST microservice in `backend/` (Dev Port `8000`)
> - **ML Core:** PyTorch E2 Ordinal Classification & Grad-CAM Interpretability in `ml/`
> - **Quality & Reliability:** Automated Image Quality Gate in `quality_gate/` and Clinical Triage Engine in `reliability/`

---

## 1. 📌 Executive Summary & Problem Statement

### **Clinical & Operational Challenge**
Diabetic Retinopathy (DR) is a leading cause of preventable blindness worldwide and particularly severe in rural India, where:
1. **Vitreoretinal Specialist Scarcity:** Over 80% of eye specialists are concentrated in tier-1 urban hubs, leaving rural Primary Health Centres (PHCs) severely underserved.
2. **Suboptimal Fundus Image Quality:** Non-mydriatic fundus cameras operated by community health workers (ASHA/ANM) frequently produce images with optical blur, dust artifacts, corneal glare, or underexposure.
3. **Black-Box AI Resistance:** Ophthalmic clinicians reject black-box neural network outputs without interpretability visualizations.
4. **Risk of Silent Blindness:** A false negative on referable DR (Grade 2+) delays critical laser photocoagulation or anti-VEGF intervention, resulting in permanent vision loss.

### **Engineering Solution**
- **Automated Quality Gate:** Pre-evaluates images for blur (Laplacian variance) and illumination entropy before inference, issuing immediate recapture prompts for ungradable fundus scans.
- **E2 Retinal Preprocessing:** Validated pipeline consisting of `crop_pad_512` $\rightarrow$ `resize` $\rightarrow$ `ImageNet normalization` (Ben Graham and CLAHE were not validated for E2 and are excluded from production).
- **Deep Learning Model Core (E2 Ordinal Model):** E2 ordinal EfficientNet-B0 architecture featuring a **4-output ordinal head** (NOT 5-class softmax). The 4 cumulative threshold logits ($p_1, p_2, p_3, p_4$) are decoded into 5 discrete grade probabilities ($P(Y=0)$ through $P(Y=4)$).
- **Temperature Calibration:** Validation-fitted temperature scaling ($T = 2.07$) with a referable DR threshold of $P(\text{Grade } 2\text{--}4) \ge 0.28$ (validation-derived, non-clinically validated).
- **Explainable AI (Grad-CAM):** Generates gradient Class Activation Maps acting as a **model interpretability heatmap** (NOT an exact lesion localization or pathology segmentation tool).
- **Clinical Triage Engine:** Evaluates output confidence and categorizes screening results into:
  - `RELIABLE_SCREENING`: Confident prediction; automated follow-up scheduled.
  - `HUMAN_REVIEW_RECOMMENDED`: Borderline/uncertain case flagged for tele-ophthalmology review.
  - `IMAGE_RECAPTURE_REQUIRED`: Substandard image quality; prompt issued to re-screen patient.
- **Lesion Status:** Set to `"unavailable"` (no validated lesion segmentation model is currently integrated).

---

## 2. 🗂️ Consolidated Project Architecture

```text
Smart Move hackathon/
│
├── client/                         # React 18 + TypeScript + Vite Clinical Frontend (Port 5173)
│   ├── src/
│   │   ├── components/             # UI elements (hero, screening, visualization, common)
│   │   ├── pages/                  # SPA pages (Home, Screening, Architecture, Explainability, etc.)
│   │   ├── services/               # API clients (screeningService.ts, api.ts -> http://localhost:8000/api)
│   │   ├── routes/                 # Router configuration (AppRoutes.tsx)
│   │   └── types/                  # TypeScript definitions (screening.ts, patient.ts, dashboard.ts)
│   ├── package.json                # Dependencies (React, Lucide icons, Tailwind)
│   └── vite.config.ts              # Vite dev server configuration (Port 5173, /api proxy -> Port 8000)
│
├── backend/                        # FastAPI REST Application Layer (Port 8000)
│   ├── main.py                     # FastAPI entry point with CORS middleware
│   └── app/
│       ├── config.py               # Application & model paths configuration
│       ├── routes/                 # REST endpoints
│       │   ├── health.py           # /api/v1/health & /reload-weights
│       │   ├── quality.py          # /api/v1/quality/check
│       │   ├── prediction.py       # /api/v1/predict & /api/v1/predict/full-screening
│       │   └── report.py           # /api/v1/report/generate
│       ├── schemas/                # Pydantic request/response models
│       │   ├── prediction.py       # Quality, prediction (grade, grade_probabilities, p_referable, referable)
│       │   └── report.py           # Patient referral report schemas
│       └── services/               # Core business logic orchestrators
│           ├── model_service.py    # Singleton PyTorch E2 inference service
│           ├── quality_service.py  # Image sharpness and contrast evaluator
│           ├── explainability_service.py # Grad-CAM Base64 heatmap generator
│           └── reliability_service.py   # Clinical triage & uncertainty engine
│
├── ml/                             # Machine Learning & Explainable AI Core
│   ├── models/
│   │   └── model_factory.py        # PyTorch E2 Ordinal EfficientNet-B0 (num_classes=4)
│   ├── inference/
│   │   ├── predictor.py            # DRPredictor class (crop_pad_512, E2 ordinal decoding, T=2.07)
│   │   ├── preprocessing.py        # crop_pad_512, resize, ImageNet normalization
│   │   └── calibration.py          # TemperatureScaler (T = 2.07, referable threshold = 0.28)
│   ├── explainability/
│   │   └── gradcam.py              # PyTorch Grad-CAM interpretability heatmap
│   └── weights/
│       └── README.md               # Weight download instructions (efficientnet_b0_aptos.pth)
│
├── quality_gate/                   # Fundus Image Quality Verification
│   ├── blur_detection.py           # Laplacian variance & high-frequency edge analysis
│   ├── illumination.py             # Over/underexposure & luminance entropy checks
│   └── quality_check.py            # Quality Gate master orchestrator (pass/fail status)
│
├── reliability/                    # Clinical Triage Engine
│   ├── confidence.py               # Shannon entropy & margin scoring
│   ├── evidence_fusion.py          # Consistency check
│   └── decision_engine.py          # Triage decision logic (Reliable / Review / Recapture)
│
├── lesion_analysis/                # Microaneurysm & Lesion Analysis (Placeholder)
│   └── inference/
│       └── lesion_detector.py      # Lesion status currently returns "unavailable"
│
├── simulation/                     # Rural PHC Queue & Workflow Simulation
│   └── matlab/
│       └── rural_screening_workflow.m # MATLAB queueing & workload reduction simulation
│
├── tests/                          # Automated Verification Suite
│   ├── test_backend/               # FastAPI TestClient API endpoint tests
│   ├── test_integration/           # End-to-end processing pipeline tests
│   └── test_ml/                    # Image preprocessing & tensor shape tests
│
├── requirements.txt                # Python dependencies (PyTorch, FastAPI, OpenCV, etc.)
├── .gitignore                      # Git ignore patterns (weights *.pth/*.pt, caches, node_modules)
└── README.md                       # Master project overview
```

---

## 3. 🩺 ETDRS Diabetic Retinopathy Classification & Ordinal Decoding

### **Ordinal Head Decoding Mathematics**
The E2 model has 4 outputs corresponding to cumulative thresholds:
- $p_1 = \sigma(z_{\text{scaled}, 1}) = P(Y \ge 1)$
- $p_2 = \sigma(z_{\text{scaled}, 2}) = P(Y \ge 2)$
- $p_3 = \sigma(z_{\text{scaled}, 3}) = P(Y \ge 3)$
- $p_4 = \sigma(z_{\text{scaled}, 4}) = P(Y \ge 4)$

These are decoded into 5 discrete ETDRS grade probabilities ($P(Y=k)$ for $k \in \{0, 1, 2, 3, 4\}$):
- $P(Y=0) = \max(0, 1 - p_1)$
- $P(Y=1) = \max(0, p_1 - p_2)$
- $P(Y=2) = \max(0, p_2 - p_3)$
- $P(Y=3) = \max(0, p_3 - p_4)$
- $P(Y=4) = p_4$

Referable DR condition: $p_{\text{referable}} = P(Y \ge 2) = p_2 \ge 0.28$.

| Grade | Disease Stage | Pathological Indicators | Referable Status |
| :---: | :--- | :--- | :---: |
| **0** | **No DR** | Normal retina; no lesions observed | Non-Referable |
| **1** | **Mild NPDR** | Microaneurysms only | Non-Referable |
| **2** | **Moderate NPDR** | Microaneurysms, hemorrhages, hard exudates | **Referable** |
| **3** | **Severe NPDR** | >20 intraretinal hemorrhages in 4 quadrants | **Referable** |
| **4** | **Proliferative DR (PDR)** | Neovascularization, vitreous hemorrhage | **Referable** |

---

## 4. 📊 Model Performance Metrics (Held-Out Benchmark)

> **Note:** The following metrics are derived from a held-out test evaluation ($n=513$) and do **NOT** constitute formal clinical trial validation.

| Metric | Score |
| :--- | :---: |
| **Accuracy** | `0.795` |
| **Balanced Accuracy** | `0.617` |
| **Macro F1** | `0.609` |
| **Quadratic Weighted Kappa (QWK)** | `0.887` |
| **Expected Calibration Error (ECE)** | `0.040` |
| **Referable Sensitivity** | `0.964` |
| **Referable Specificity** | `0.908` |
| **Severe DR Recall** | `0.450` |
| **Proliferative DR Recall** | `0.371` |

---

## 5. 🚀 Developer Quickstart Guide

### **Backend Execution (FastAPI)**
```bash
# Navigate to workspace root
cd "e:\Smart Move hackathon"

# Launch FastAPI backend server on port 8000
uvicorn backend.main:app --reload --port 8000
```
- Interactive API Specs (Swagger UI): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

### **Frontend Execution (React + Vite)**
```bash
# Navigate to client directory
cd "e:\Smart Move hackathon\client"

# Start Vite development server on port 5173
npm run dev
```
- Access application UI at `http://localhost:5173`

---

## 6. 💡 Instructions for ChatGPT & AI Coding Assistants

1. **Architecture Target:** Frontend in `client/` (React + TypeScript + Vite, Port 5173), Backend in `backend/` (FastAPI, Port 8000).
2. **Model Architecture:** E2 Ordinal EfficientNet-B0 with a 4-output ordinal head (`num_classes=4`). Never describe as "5-class softmax".
3. **Preprocessing:** Strictly `crop_pad_512` $\rightarrow$ `resize` $\rightarrow$ `ImageNet normalization`. Do NOT add Ben Graham or CLAHE to the E2 production path.
4. **Calibration Parameters:** Temperature $T = 2.07$, referable threshold = $0.28$ ($P(Y \ge 2) \ge 0.28$). Non-clinically validated.
5. **Grad-CAM:** Describe strictly as a "model interpretability heatmap", NOT as exact lesion localization or pathology segmentation.
6. **Lesion Status:** Always return `lesion_status = "unavailable"`.
7. **No Fake Weights:** System operates with transparent pending state when weights (`efficientnet_b0_aptos.pth`) are missing.
