import { apiClient } from "./apiClient";

export async function getPortfolioOverview() {
  const { data } = await apiClient.get("/portfolio/overview");
  return data;
}

export async function getPortfolioSettings() {
  const { data } = await apiClient.get("/portfolio/settings");
  return data;
}

export async function savePortfolioSettings(config) {
  const { data } = await apiClient.put("/portfolio/settings", config);
  return data;
}

export async function resetPortfolioSettings() {
  const { data } = await apiClient.post("/portfolio/settings/reset");
  return data;
}
