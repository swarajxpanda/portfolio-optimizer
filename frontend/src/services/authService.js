import { API_BASE_URL, apiClient } from "./apiClient";

export async function getAuthStatus() {
  const { data } = await apiClient.get("/auth/status");
  return Boolean(data.authenticated);
}

export function redirectToKiteLogin() {
  window.location.href = `${API_BASE_URL}/auth/login`;
}
