import { useCallback } from "react";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { getExitSignals } from "../../../services/exitSignalsService";

export function useExitSignals() {
  return useAsyncData(useCallback(() => getExitSignals(), []), {
    errorMessage: "Failed to load exit signals",
  });
}
