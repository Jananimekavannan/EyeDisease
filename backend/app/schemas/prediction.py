"""
Pydantic Schemas for Diabetic Retinopathy Predictions & Auditable Triage.
"""
from typing import Optional, Dict, Any, List, Literal
from pydantic import BaseModel, Field


class QualityMetric(BaseModel):
    is_gradable: bool
    status: str
    quality_score: float
    fundus_coverage: Optional[float] = None
    blur_metrics: Optional[Dict[str, Any]] = None
    illumination_metrics: Optional[Dict[str, Any]] = None
    identified_issues: List[str] = Field(default_factory=list)
    action_required: str


class PredictionResult(BaseModel):
    status: str
    is_placeholder: bool = False
    message: str
    model_name: str
    grade: Optional[int] = None
    grade_probabilities: Optional[Dict[str, float]] = None
    confidence: Optional[float] = None
    p_referable: Optional[float] = None
    referable: Optional[bool] = None
    predicted_grade: Optional[int] = None
    severity_label: Optional[str] = None
    description: Optional[str] = None
    raw_probabilities: Optional[Dict[str, float]] = None
    calibrated_probabilities: Optional[Dict[str, float]] = None
    class_probabilities: Optional[Dict[str, float]] = None
    referable_dr: Optional[bool] = None
    preprocessing_completed: bool = True


class GradCAMResponse(BaseModel):
    available: bool
    status: str
    message: str
    heatmap_base64: Optional[str] = None
    overlay_base64: Optional[str] = None


class TriageResult(BaseModel):
    decision: str
    reasons: List[str] = Field(default_factory=list)
    referable_dr: bool = False
    evidence_status: str = "unavailable"
    lesion_status: str = "unavailable"
    action_steps: List[str] = Field(default_factory=list)


class CompleteScreeningResponse(BaseModel):
    success: bool
    filename: Optional[str] = None
    timestamp: str
    quality_gate: QualityMetric
    prediction: PredictionResult
    explainability: Optional[GradCAMResponse] = None
    lesion_status: Literal["unavailable"]
    triage: Optional[TriageResult] = None
