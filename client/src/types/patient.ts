import type { DRCategory } from './screening';

export interface PatientScreeningRecord {
  id: string;
  date: string;
  eye: string;
  grade: DRCategory | string;
  confidence: number;
  lesionsCount: number;
  microaneurysms: number;
  hardExudates: number;
  hemorrhages: number;
  attentionRegion: string;
  recommendation: string;
  heatmapUrl?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  primaryPhone: string;
  lastScreeningDate: string;
  riskCategory: DRCategory | string;
  confidence: number;
  reviewStatus: 'Pending Review' | 'Flagged Urgent' | 'Verified Normal' | 'Reviewed';
  assignedDoctor: string;
  imageQuality: string;
  screenings: PatientScreeningRecord[];
}
