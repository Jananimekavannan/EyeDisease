"""
Prediction & Comprehensive Screening API Routes.
Orchestrates:
Fundus Upload -> Quality Gate -> Preprocessing -> EfficientNet-B0 -> Grad-CAM -> Reliability Engine.
"""
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ml.inference.predictor import ModelUnavailableError
from backend.app.services.model_service import ModelService
from backend.app.services.quality_service import QualityService
from backend.app.services.explainability_service import ExplainabilityService
from backend.app.services.reliability_service import ReliabilityService

router = APIRouter(prefix="/predict", tags=["AI Prediction & Screening"])
MAX_IMAGE_BYTES = 25 * 1024 * 1024


async def _read_image(file: UploadFile) -> bytes:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file.")
    image_bytes = await file.read(MAX_IMAGE_BYTES + 1)
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 25 MB upload limit.")
    return image_bytes


@router.post("")
async def predict_dr_severity(file: UploadFile = File(...)):
    """
    Core Milestone 1 Endpoint:
    Accepts fundus image -> runs preprocessing -> invokes EfficientNet-B0 model -> returns DR prediction.
    """
    image_bytes = await _read_image(file)

    # Execute model prediction
    try:
        prediction = ModelService.predict(image_bytes)
    except ModelUnavailableError:
        raise HTTPException(status_code=503, detail="Production model unavailable.")
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Uploaded image is corrupt or unsupported.")
    except Exception:
        raise HTTPException(status_code=503, detail="Screening inference unavailable.")

    return {
        "success": True,
        "filename": file.filename,
        "timestamp": datetime.utcnow().isoformat(),
        "prediction": prediction
    }


@router.post("/full-screening")
async def full_screening_pipeline(
    file: UploadFile = File(...),
    include_gradcam: bool = Form(default=True)
):
    """
    Full production screening pipeline:
    1. Quality gate
    2. E2 ordinal EfficientNet-B0 inference (only when quality passes)
    3. Grad-CAM (only when quality passes and requested)
    4. Reliability / triage
    """
    image_bytes = await _read_image(file)

    # 1. Quality gate always runs first.
    try:
        quality_res = QualityService.evaluate(image_bytes)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Uploaded image is corrupt or unsupported.")
    except Exception:
        raise HTTPException(status_code=503, detail="Image quality service unavailable.")

    # 2. Never present model output as a screening result when quality fails.
    if not quality_res.get("is_gradable", False):
        prediction_res = {
            "status": "quality_failed",
            "is_placeholder": False,
            "message": "Screening unavailable: image quality failed the automated quality gate.",
            "model_name": "E2 Ordinal EfficientNet-B0",
            "grade": None,
            "grade_probabilities": None,
            "confidence": None,
            "p_referable": None,
            "referable": None,
            "predicted_grade": None,
            "severity_label": "Screening Unavailable",
            "description": "Image quality is insufficient for AI screening analysis.",
            "raw_probabilities": None,
            "calibrated_probabilities": None,
            "class_probabilities": None,
            "referable_dr": None,
            "preprocessing_completed": False,
        }
        gradcam_res = None
    else:
        # 3. Real model inference. No sample/fallback predictions.
        try:
            prediction_res = ModelService.predict(image_bytes)
        except ModelUnavailableError:
            raise HTTPException(status_code=503, detail="Production model unavailable.")
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Uploaded image is corrupt or unsupported.")
        except Exception:
            raise HTTPException(status_code=503, detail="Screening inference unavailable.")

        # If the model is unavailable, do not fabricate a prediction.
        if include_gradcam:
            # Explain calibrated referable probability using the handoff's
            # verified conv_head target.
            gradcam_res = ExplainabilityService.generate_gradcam(
                image_bytes,
                target_class=None
            )
        else:
            gradcam_res = None

    # 4. Reliability / triage is the single source of truth for the final state.
    triage_res = ReliabilityService.evaluate_triage(
        quality_res=quality_res,
        prediction_res=prediction_res,
        gradcam_res=gradcam_res
    )

    return {
        "success": True,
        "filename": file.filename,
        "timestamp": datetime.utcnow().isoformat(),
        "quality_gate": quality_res,
        "prediction": prediction_res,
        "explainability": gradcam_res,
        "lesion_status": "unavailable",
        "triage": triage_res
    }
