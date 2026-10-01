import type { FullScreeningResponse } from '../types/screening';
import type { PatientProfile } from '../types/patient';
import type { DashboardStats } from '../types/dashboard';
import { fetchApi } from './api';

async function toUploadBlob(imageDataUrl: string): Promise<Blob> {
  if (imageDataUrl.startsWith('data:image/')) {
    const [header, encoded] = imageDataUrl.split(',');
    if (!header || !encoded) throw new Error('Selected image data is invalid.');
    const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new Blob([bytes], { type: mime });
  }

  const response = await fetch(imageDataUrl);
  if (!response.ok) throw new Error(`Unable to load selected image (${response.status}).`);
  return response.blob();
}

/** Uploads the selected image bytes and returns the backend response contract unchanged. */
export async function analyzeRetinalImage(
  imageName: string,
  imageDataUrl: string,
): Promise<FullScreeningResponse> {
  if (!imageDataUrl) throw new Error('Select a retinal image before screening.');

  const formData = new FormData();
  formData.append('file', await toUploadBlob(imageDataUrl), imageName);
  formData.append('include_gradcam', 'true');

  let response: Response;
  try {
    response = await fetch('http://127.0.0.1:8000/api/v1/predict/full-screening', {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error('Screening service unavailable. Please check that the backend is running.');
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = typeof body.detail === 'string' ? body.detail : '';
    } catch {
      // The status still gives a useful controlled error if the body is not JSON.
    }
    throw new Error(detail || `Screening service returned HTTP ${response.status}.`);
  }

  return mapScreeningResponse(await response.json());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGradeProbabilityRecord(value: unknown): value is Record<string, number> {
  const gradeKeys = ['grade_0', 'grade_1', 'grade_2', 'grade_3', 'grade_4'];
  return isRecord(value) && gradeKeys.every((key) => typeof value[key] === 'number');
}

/** Validate/map API names into the UI contract without inventing missing values. */
function mapScreeningResponse(value: unknown): FullScreeningResponse {
  if (!isRecord(value) || value.success !== true || typeof value.timestamp !== 'string' ||
      !(typeof value.filename === 'string' || value.filename === null) ||
      !isRecord(value.quality_gate) || !isRecord(value.prediction) || !isRecord(value.triage) ||
      !(isRecord(value.explainability) || value.explainability === null) ||
      value.lesion_status !== 'unavailable') {
    throw new Error('Screening service returned an invalid response.');
  }

  const quality = value.quality_gate;
  const prediction = value.prediction;
  const triage = value.triage;
  if (typeof quality.is_gradable !== 'boolean' || typeof quality.status !== 'string' ||
      typeof quality.quality_score !== 'number' || !Array.isArray(quality.identified_issues) ||
      typeof quality.action_required !== 'string' || typeof prediction.status !== 'string' ||
      typeof prediction.model_name !== 'string' || !(typeof prediction.grade === 'number' || prediction.grade === null) ||
      !(typeof prediction.confidence === 'number' || prediction.confidence === null) ||
      !(typeof prediction.p_referable === 'number' || prediction.p_referable === null) ||
      !Array.isArray(triage.reasons) || !Array.isArray(triage.action_steps) ||
      typeof triage.decision !== 'string') {
    throw new Error('Screening service returned an invalid response.');
  }

  if (quality.is_gradable) {
    if (prediction.status !== 'success' || typeof prediction.grade !== 'number' ||
        typeof prediction.confidence !== 'number' || typeof prediction.p_referable !== 'number' ||
        !isGradeProbabilityRecord(prediction.grade_probabilities) ||
        !isRecord(prediction.calibrated_probabilities)) {
      throw new Error('Screening service omitted required model results for a gradable image.');
    }
  } else if (prediction.grade !== null || prediction.confidence !== null ||
      prediction.p_referable !== null || prediction.grade_probabilities !== null ||
      value.explainability !== null) {
    throw new Error('Screening service returned model results for a rejected image.');
  }

  return value as unknown as FullScreeningResponse;
}

// These endpoints have no production data source in this repository. Errors are
// surfaced to the owning pages instead of substituting demo records or metrics.
export function getDashboardStats(): Promise<DashboardStats> {
  return fetchApi<DashboardStats>('/dashboard/stats');
}

export function getAllPatients(): Promise<PatientProfile[]> {
  return fetchApi<PatientProfile[]>('/patients');
}

export function getPatientById(id: string): Promise<PatientProfile> {
  return fetchApi<PatientProfile>(`/patients/${encodeURIComponent(id)}`);
}
