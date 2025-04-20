import api from "./api";

export const investorService = {
  async getDashboardStats() {
    const res = await api.get("/investor/dashboard-stats");
    return res.data;
  },
  async getRecentStartups(limit = 5) {
    const res = await api.get("/startups", { params: { limit } });
    // Support both {results: []} and [] shapes
    const data: any = res.data;
    return Array.isArray(data) ? data : data?.results || [];
  },
  async getEvaluationDetail(id: string) {
    const res = await api.get(`/evaluations/${id}/`);
    return res.data;
  },
  async getAIOpportunities() {
    const res = await api.get(`/investor/ai-opportunities/`);
    const data: any = res.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async getTrendingStartups(limit = 6) {
    const res = await api.get("/investor/trending-startups/", { params: { limit } });
    const data: any = res.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async getRecentFundingEvents(limit = 8) {
    const res = await api.get("/investor/recent-funding/", { params: { limit } });
    const data: any = res.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  async getMyMatches(limit = 6) {
    const res = await api.get("/investor/my-matches/", { params: { limit } });
    const data: any = res.data;
    return Array.isArray(data) ? data : data?.results || [];
  },
  
  // Pipeline
  async getPipeline() {
    const res = await api.get("/investor/pipeline");
    const data: any = res.data;
    return Array.isArray(data) ? data : data?.results ?? [];
  },
  async addToPipeline(startupId: string, stage: string = "New Startups") {
    const res = await api.post("/investor/pipeline", { startup: startupId, stage });
    return res.data;
  },
  async updatePipelineStage(startupId: string, stage: string) {
    const res = await api.patch(`/investor/pipeline/${startupId}`, { stage });
    return res.data;
  },
  
  // Contacts
  async getContacts() {
    const res = await api.get("/investor/contacts");
    const data: any = res.data;
    return Array.isArray(data) ? data : data?.results ?? [];
  },
};
