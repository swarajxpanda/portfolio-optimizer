import { apiClient } from "./apiClient";

export async function getExitSignals() {
  const { data } = await apiClient.get("/exit/signals");
  return data;
}

export async function getExitSettings() {
  const { data } = await apiClient.get("/exit/settings");
  return data;
}

export async function saveExitSettings(config) {
  const { data } = await apiClient.put("/exit/settings", config);
  return data;
}

export async function resetExitSettings() {
  const { data } = await apiClient.post("/exit/settings/reset");
  return data;
}
