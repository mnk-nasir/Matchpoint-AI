import api from "../services/api";

/**
 * Investor Match Engine API Client
 * Fetches the top investor matches for a given startup.
 */
export async function getInvestorMatches(startupId) {
  if (!startupId) return [];
  try {
    const res = await api.get(`/startups/${startupId}/investor-matches-v2/`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch investor matches:", err);
    return [];
  }
}
