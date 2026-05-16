import pandas as pd
from datetime import date, timedelta
from core.kite import get_kite


LONG_WINDOW_DAYS = 252
MIN_CLOSE_POINTS = LONG_WINDOW_DAYS + 1
FETCH_CHUNK_DAYS = 180
MAX_LOOKBACK_DAYS = 900


def get_holdings():
    kite = get_kite()
    return pd.DataFrame(kite.holdings())


def _extract_cash_value(payload):
    if not isinstance(payload, dict):
        return 0.0

    available = payload.get("available") if isinstance(payload.get("available"), dict) else {}
    for key in ("cash", "live_balance", "opening_balance"):
        value = available.get(key)
        if value is not None:
            try:
                return max(float(value), 0.0)
            except (TypeError, ValueError):
                continue

    for key in ("cash", "live_balance"):
        value = payload.get(key)
        if value is not None:
            try:
                return max(float(value), 0.0)
            except (TypeError, ValueError):
                continue

    return 0.0


def get_cash_value() -> float:
    kite = get_kite()
    try:
        margins = kite.margins("equity")
    except TypeError:
        margins = kite.margins()
    except Exception:
        return 0.0

    if isinstance(margins, list):
        for item in margins:
            cash_value = _extract_cash_value(item)
            if cash_value > 0:
                return cash_value
        return 0.0

    return _extract_cash_value(margins)


def get_historical_data(instrument_tokens: list[int]) -> dict[int, pd.DataFrame]:
    """
    Fetch the latest available trading-day history needed to support a
    252-session baseline. We walk backward in chunks and keep only the most
    recent rows so weekends and market holidays don't break the window.
    Returns {instrument_token: DataFrame(date, open, high, low, close, volume)}.
    """
    kite = get_kite()
    history = {}
    for token in instrument_tokens:
        try:
            end_date = date.today()
            all_frames = []
            fetched_days = 0

            while fetched_days < MAX_LOOKBACK_DAYS:
                start_date = end_date - timedelta(days=FETCH_CHUNK_DAYS)
                records = kite.historical_data(
                    instrument_token=token,
                    from_date=start_date,
                    to_date=end_date,
                    interval="day",
                )

                if records:
                    frame = pd.DataFrame(records)
                    frame["date"] = pd.to_datetime(frame["date"]).dt.date
                    all_frames.append(frame)

                    combined = (
                        pd.concat(all_frames, ignore_index=True)
                        .drop_duplicates(subset=["date"], keep="last")
                        .sort_values("date")
                    )
                    if len(combined) >= MIN_CLOSE_POINTS:
                        history[token] = combined.tail(MIN_CLOSE_POINTS).reset_index(drop=True)
                        break

                fetched_days += FETCH_CHUNK_DAYS
                end_date = start_date - timedelta(days=1)

            if token not in history and all_frames:
                combined = (
                    pd.concat(all_frames, ignore_index=True)
                    .drop_duplicates(subset=["date"], keep="last")
                    .sort_values("date")
                    .reset_index(drop=True)
                )
                history[token] = combined.tail(MIN_CLOSE_POINTS)
        except Exception:
            # Skip instruments where historical data is unavailable
            pass

    return history

