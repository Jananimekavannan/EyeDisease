"""
Pydantic Schemas for Clinical Screening Reports & Patient Records.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PatientInfo(BaseModel):
    patient_id: str = Field(..., example="PT-2026-0814")
    name: str = Field(..., example="Ramesh Kumar")
    age: int = Field(..., example=54)
    gender: str = Field(..., example="Male")
    eye_examined: str = Field(default="Right (OD)", example="Right (OD)")
    diabetes_duration_years: Optional[float] = Field(default=8.0, example=8.0)
    hba1c_level: Optional[float] = Field(default=8.4, example=8.4)
    clinic_location: Optional[str] = Field(default="PHC Dindigul, Tamil Nadu", example="PHC Dindigul, Tamil Nadu")


class ScreeningReportRequest(BaseModel):
    patient: PatientInfo
    predicted_grade: Optional[int]
    severity_label: Optional[str]
    confidence: Optional[float]
    triage_decision: Optional[str]
    referral_urgency: Optional[str]
    clinical_notes: Optional[str] = ""


class ScreeningReportResponse(BaseModel):
    report_id: str
    generated_at: str
    patient: PatientInfo
    clinical_summary: str
    recommendation: str
    export_url: Optional[str] = None
