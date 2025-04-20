/**
 * Simulated Market Intelligence Engine
 * Generates deterministic mock intelligence signals based on the startup's ID.
 */

import api from "../services/api";

/**
 * Market Intelligence API Client
 * Fetches real news activity, sentiment, and momentum from the backend.
 */
export async function generateMarketIntelligence(startup) {
  if (!startup || !startup.id) {
    return {
      newsScore: 0,
      sentimentScore: 0,
      momentumScore: 0,
      marketMomentum: "Low",
      recentNewsActivity: "Low",
      investorAttention: "Stable"
    };
  }

  try {
    const res = await api.get(`/startups/${startup.id}/market-intelligence/`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch market intelligence:", err);
    return {
      newsScore: 40,
      sentimentScore: 40,
      momentumScore: 40,
      marketMomentum: "Moderate",
      recentNewsActivity: "Moderate",
      investorAttention: "Stable"
    };
  }
}
