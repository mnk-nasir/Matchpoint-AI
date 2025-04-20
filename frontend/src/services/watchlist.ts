import api from "./api";

export type WatchItem = {
  id: string; // The watchlist API record ID
  startup: string; // The startup UUID
  startup_name?: string;
  startup_industry?: string | null;
  startup_funding_ask?: string | null;
  startup_risk_score?: number | null;
  startup_logo_url?: string | null;
  created_at?: string;
};

export const watchlist = {
  async load(): Promise<WatchItem[]> {
    try {
      const res = await api.get("/investor/watchlist");
      const data: any = res.data;
      return Array.isArray(data) ? data : data?.results ?? [];
    } catch {
      return [];
    }
  },
  async has(startupId: string): Promise<boolean> {
    const list = await this.load();
    return list.some((w) => w.startup === startupId);
  },
  async add(startupId: string): Promise<void> {
    try {
      await api.post("/investor/watchlist", { startup: startupId });
    } catch {
      // ignore
    }
  },
  async remove(startupId: string): Promise<void> {
    try {
      await api.delete(`/investor/watchlist/${startupId}`);
    } catch {
      // ignore
    }
  },
};
