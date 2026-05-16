from __future__ import annotations

import pandas as pd

from .engine import compute_fragility_overview as _compute_fragility_overview


def compute_fragility_overview(
    holdings_df: pd.DataFrame,
    history: dict[int, pd.DataFrame],
    cash_value: float = 0.0,
) -> dict:
    return _compute_fragility_overview(holdings_df, history, cash_value=cash_value)

