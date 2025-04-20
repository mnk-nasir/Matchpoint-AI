import api from "./api";

export interface AdminInvestor {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  is_investor: boolean;
  date_joined: string;
}

export interface CreateInvestorPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  password: string;
}

export const adminInvestorsService = {
  async list(query?: { email?: string }) {
    const res = await api.get<AdminInvestor[]>("/admin/investors/", { params: query });
    return res.data;
  },
  async create(payload: CreateInvestorPayload) {
    const res = await api.post<AdminInvestor>("/admin/investors/", payload);
    return res.data;
  },
  async createFromLead(lead_id: number, password: string) {
    const res = await api.post<AdminInvestor>("/admin/investors/from-lead/", { lead_id, password });
    return res.data;
  },
  async update(id: string, payload: Partial<CreateInvestorPayload>) {
    const res = await api.patch<AdminInvestor>(`/admin/investors/${id}/`, payload);
    return res.data;
  },
};

