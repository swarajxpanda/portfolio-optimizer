from .data import get_cash_value, get_historical_data, get_holdings
from .compute import compute_fragility_overview


def get_fragility_overview():
    df = get_holdings()
    tokens = df["instrument_token"].dropna().unique().tolist() if not df.empty else []
    history = get_historical_data(tokens) if tokens else {}
    try:
        cash_value = get_cash_value()
    except Exception:
        cash_value = 0.0
    return compute_fragility_overview(df, history, cash_value=cash_value)
