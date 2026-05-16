import { apiClient } from "./apiClient";

export async function getFragilityOverview() {
  const { data } = await apiClient.get("/fragility/overview");
  return data;
}
