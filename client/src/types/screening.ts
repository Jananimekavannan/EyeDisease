export type ReliabilityStatus =
  | 'IMAGE_RECAPTURE_REQUIRED'
  | 'HUMAN_REVIEW_RECOMMENDED'
  | 'RELIABLE_SCREENING'
  | 'PENDING_MODEL_TRAINING';

export type DRCategory =
  | 'No DR'
  | 'Mild NPDR'
  | 'Moderate NPDR'
  | 'Severe NPDR'
  | 'Proliferative DR';

export interface BackendQualityGate {
  is_gradable: boolean;
  status: string;
  quality_score: number;
  fundus_coverage?: number;
  blur_metrics?: { is_sharp?: boolean; blur_score?: number; blur_threshold?: number };
  illumination_metrics?: {
    is_well_illuminated?: boolean;
    mean_luminance?: number;
    contrast_std?: number;
  };
  identified_issues: string[];
  action_required: string;
}

export interface BackendPrediction {
  status: string;
  is_placeholder: boolean;
  message: string;
  model_name: string;
  grade: number | null;
  grade_probabilities: Record<string, number> | null;
  confidence: number | null;
  p_referable: number | null;
  referable: boolean | null;
  predicted_grade: number | null;
  severity_label: string | null;
  description: string | null;
  raw_probabilities: Record<string, number> | null;
  calibrated_probabilities: Record<string, number> | null;
  class_probabilities: Record<string, number> | null;
  referable_dr: boolean | null;
  preprocessing_completed: boolean;
}

export interface BackendGradCAM {
  available: boolean;
  status: string;
  message: string;
  heatmap_base64?: string | null;
  overlay_base64?: string | null;
}

export interface BackendTriage {
  decision: ReliabilityStatus;
  reasons: string[];
  referable_dr: boolean;
  evidence_status: string;
  lesion_status: string;
  action_steps: string[];
}

/** Exact JSON contract returned by POST /api/v1/predict/full-screening. */
export interface FullScreeningResponse {
  success: boolean;
  filename: string | null;
  timestamp: string;
  quality_gate: BackendQualityGate;
  prediction: BackendPrediction;
  explainability: BackendGradCAM | null;
  lesion_status: 'unavailable';
  triage: BackendTriage;
}
