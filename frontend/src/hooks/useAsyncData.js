import { useEffect, useReducer } from "react";
import toast from "react-hot-toast";

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, error: null, loading: true };
    case "success":
      return { ...state, data: action.payload, error: null, loading: false };
    case "error":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function useAsyncData(loader, options = {}) {
  const { errorMessage = "Failed to load data", enabled = true } = options;
  const [refreshKey, forceRefresh] = useReducer((value) => value + 1, 0);
  const [state, dispatch] = useReducer(reducer, {
    data: null,
    error: null,
    loading: Boolean(enabled),
  });

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    dispatch({ type: "loading" });

    loader()
      .then((payload) => {
        if (!cancelled) {
          dispatch({ type: "success", payload });
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          dispatch({ type: "error", payload: loadError });
          toast.error(errorMessage);
        }
      })

    return () => {
      cancelled = true;
    };
  }, [enabled, errorMessage, loader, refreshKey]);

  return {
    ...state,
    refresh: forceRefresh,
  };
}
