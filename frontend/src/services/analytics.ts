import api from "./api";

export interface AnalyticsSummary {
  user_history: Array<{ ts: string; total_score: number; rating: string }>;
  benchmark: {
    avg_total_score: number;
    max_total_score: number;
    total_evaluations: number;
    by_stage: Array<{ stage: string; avg_score: number; count: number }>;
  };
}

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    const res = await api.get("/evaluations/analytics/summary/");
    return res.data as AnalyticsSummary;
  },
};

