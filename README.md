# RETINA-X retinal screening prototype

This repository contains a React client, a FastAPI backend, the frozen E2 ordinal EfficientNet-B0 checkpoint, the quality gate, reliability logic, and the Grad-CAM handoff. It is a prototype engineering workflow, not a clinically validated diagnostic product.

## Live screening flow

1. The browser uploads the selected image to `POST /api/v1/predict/full-screening`.
2. The backend evaluates retinal coverage, masked focus, and illumination.
3. A rejected image returns `IMAGE_RECAPTURE_REQUIRED` without model grade, probabilities, or Grad-CAM.
4. A passing image is processed with `crop_pad_512`, 224×224 RGB input, ImageNet normalization, and the frozen E2 ordinal model.
5. The backend returns calibrated grade probabilities, calibrated `P(Grade 2–4)`, reliability triage, and a Grad-CAM attention map when available.
6. The client displays the response fields. Lesion detection and vessel segmentation are unavailable.

## Run locally

Start the API from the repository root:

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

In another terminal, start the client:

```bash
cd client
npm install
npm run dev
```

The screening page calls the API at `http://127.0.0.1:8000`. The required production checkpoint is `ml/weights/efficientnet_b0_aptos.pth`; its SHA-256 is verified at model load. Missing or invalid weights produce a controlled model-unavailable response.

## Limitations

- Prototype quality and reliability thresholds are engineering rules, not clinical standards.
- Grad-CAM is an attention map, not lesion detection, segmentation, or clinical proof. The handoff reports an FP32 log-probability cross-check mismatch, approximately 48% mean CAM mass inside the fundus mask, and faithfulness of 6/15.
- Grade 3/4 recall is weak in the historical evaluation. The model is not clinically validated.
- Patient storage, audit history, lesion detection, vessel segmentation, and offline inference are not connected.
