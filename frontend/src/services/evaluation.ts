import api from './api';

type AnyRecord = Record<string, unknown>;

export interface FullEvaluationPayload {
  step1: AnyRecord;
  step2: AnyRecord;
  step3: AnyRecord;
  step4: AnyRecord;
  step5: AnyRecord;
  step6: AnyRecord;
  step7: AnyRecord;
  step8: AnyRecord;
}

export interface EvaluationResult {
  evaluation_id: string;
  total_score: number;
  rating: string;
  strengths: string[];
  weaknesses: string[];
  risk_flags?: string[];
  company_name?: string;
  created_at?: string;
}

export interface EvaluationDetail extends EvaluationResult {
  legal_structure?: string;
  incorporation_year?: number | null;
  country?: string;
  stage?: string;
  funding_raised?: number;
}

export const evaluationService = {
  submitFullEvaluation: async (
    payload: FullEvaluationPayload
  ): Promise<EvaluationResult> => {
    const res = await api.post('/evaluations/submit/', payload);
    return res.data as EvaluationResult;
  },

  getEvaluation: async (id: string): Promise<EvaluationDetail> => {
    const res = await api.get(`/evaluations/${id}/`);
    return res.data as EvaluationDetail;
  },

  getNews: async (id: string): Promise<any> => {
    const res = await api.get(`/startups/${id}/news/`);
    return res.data;
  },
};

