"""
Quality Gate API Route.
Evaluates retinal fundus image gradability, focus sharpness, and illumination.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.services.quality_service import QualityService

router = APIRouter(prefix="/quality", tags=["Image Quality Gate"])


@router.post("/check")
async def check_image_quality(file: UploadFile = File(...)):
    """
    Evaluates whether an uploaded retinal image is gradable or requires immediate re-capture.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be a valid image format (JPEG/PNG).")

    image_bytes = await file.read(25 * 1024 * 1024 + 1)
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(image_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds the 25 MB upload limit.")

    try:
        result = QualityService.evaluate(image_bytes)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Uploaded image is corrupt or unsupported.")
    except Exception:
        raise HTTPException(status_code=503, detail="Image quality service unavailable.")
    return result
