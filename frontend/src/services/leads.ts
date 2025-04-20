import api from "./api";

export interface InvestorLeadPayload {
  name: string;
  linkedin?: string;
  email: string;
  phone?: string;
  firm?: string;
  role?: string;
  focus?: string;
}

export interface AcceleratorLeadPayload {
  program_name: string;
  website?: string;
  contact_name?: string;
  email: string;
  phone?: string;
  cohort_size?: number | string;
  focus?: string;
}

export const leadsService = {
  async submitInvestorLead(payload: InvestorLeadPayload) {
    const res = await api.post("/leads/investors/", payload);
    return res.data;
  },
  async submitAcceleratorLead(payload: AcceleratorLeadPayload) {
    const res = await api.post("/leads/accelerators/", payload);
    return res.data;
  },
};

