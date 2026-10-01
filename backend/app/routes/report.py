"""
Screening Report Generation API Route.
Prepares structured clinical reports and patient referral summaries for PHC clinicians.
"""
from datetime import datetime
import uuid
from fastapi import APIRouter
from backend.app.schemas.report import ScreeningReportRequest, ScreeningReportResponse

router = APIRouter(prefix="/report", tags=["Clinical Screening Report"])


@router.post("/generate", response_model=ScreeningReportResponse)
def generate_screening_report(req: ScreeningReportRequest):
    """
    Generates a structured clinical screening report.
    """
    report_id = f"DR-REP-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    grade_text = f"Grade {req.predicted_grade} ({req.severity_label})" if req.predicted_grade is not None else "Grading Pending"
    conf_text = f"{req.confidence * 100:.1f}%" if req.confidence is not None else "N/A"

    summary = (
        f"Screening completed for {req.patient.name} (Age: {req.patient.age}, Gender: {req.patient.gender}) "
        f"at {req.patient.clinic_location}. Examined eye: {req.patient.eye_examined}. "
        f"AI assessment finding: {grade_text} with confidence: {conf_text}."
    )

    recommendation = (
        f"Triage Decision: {req.triage_decision or 'Routine'}. "
        f"Urgency: {req.referral_urgency or 'Standard'}. {req.clinical_notes}"
    )

    return ScreeningReportResponse(
        report_id=report_id,
        generated_at=timestamp,
        patient=req.patient,
        clinical_summary=summary,
        recommendation=recommendation
    )
