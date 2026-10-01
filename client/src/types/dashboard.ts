export interface DRDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  todayScreenings: number;
  pendingReviews: number;
  highRiskCases: number;
  ruralCampsActive: number;
  totalPatientsScreened: number;
  modelAccuracy: string;
  avgInferenceTimeMs: number;
  drDistribution: DRDistribution[];
}
