import { useCallback } from "react";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { getPortfolioOverview } from "../../../services/portfolioService";

export function usePortfolioOverview() {
  return useAsyncData(useCallback(() => getPortfolioOverview(), []), {
    errorMessage: "Failed to load portfolio overview",
  });
}
