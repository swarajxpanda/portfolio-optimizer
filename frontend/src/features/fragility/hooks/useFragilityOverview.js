import { useCallback } from "react";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { getFragilityOverview } from "../../../services/fragilityService";

export function useFragilityOverview() {
  return useAsyncData(useCallback(() => getFragilityOverview(), []), {
    errorMessage: "Failed to load portfolio fragility",
  });
}
