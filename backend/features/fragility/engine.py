from __future__ import annotations

import math

import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import fcluster, linkage
from scipy.spatial.distance import squareform
from sklearn.covariance import LedoitWolf

from .settings import get_settings


DEFENSIVE_KEYWORDS = (
    "GOLD",
    "SILVER",
    "LIQUID",
    "BOND",
    "GILT",
    "UTILITY",
    "POWER",
    "CONSUM",
    "STAPLE",
    "FMCG",
    "PHARMA",
    "HEALTH",
)

THEME_LABELS = [
    ("Precious Metals", ("GOLD", "SILVER")),
    ("Utilities & Staples", ("UTILITY", "POWER", "CONSUM", "STAPLE", "FMCG")),
    ("Financials", ("BANK", "FIN", "HDFC", "ICICI", "SBI", "JIOFIN", "KOTAK", "AXIS")),
    ("Technology", ("INFY", "TCS", "WIPRO", "TECH", "HCL", "LTIM", "PERSIST")),
    ("Broad Market ETFs", ("NIFTY", "BEES", "SENSEX", "ETF")),
]


def _classification(score: float) -> str:
    if score >= 75:
        return "Healthy"
    if score >= 50:
        return "Moderate"
    return "Fragile"


def _stress_classification(multiplier: float) -> str:
    if multiplier >= 1.6:
        return "High Fragility"
    if multiplier >= 1.4:
        return "Structural Fragility"
    return "Stable"


def _regime_classification(delta: float) -> str:
    if delta >= 0.2:
        return "Compression Risk"
    if delta >= 0.15:
        return "Tightening"
    return "Stable"


def _empty_result(note: str, settings: dict, mode: str = "unavailable", metrics: list[dict] | None = None) -> dict:
    why_metrics = metrics or []
    return {
        "summary": {
            "mode": mode,
            "total_holdings": 0,
            "usable_holdings": 0,
            "portfolio_enb": 0.0,
            "diversification_score": 0.0,
            "diversification_classification": "Unavailable",
            "hhi": 0.0,
            "top_cluster_exposure": 0.0,
            "top_two_cluster_exposure": 0.0,
            "stress_risk_multiplier": 0.0,
            "stress_classification": "Unavailable",
            "correlation_regime_delta": 0.0,
            "correlation_regime_classification": "Unavailable",
            "short_window_days": settings["short_window_days"],
            "long_window_days": settings["long_window_days"],
            "strongest_pair": {"symbols": [], "corr": 0.0},
            "status_message": note,
        },
        "hero": {
            "title": note,
            "actions": [],
            "show_actions": False,
        },
        "why": {
            "metrics": why_metrics,
        },
        "evidence": {
            "collapsed_by_default": True,
            "show": False,
            "gauge": None,
            "clusters": [],
            "enb_breakdown": [],
            "cluster_bars": [],
            "correlation_regime": {"series": []},
            "stress": None,
            "matrix": {
                "method": "Ledoit-Wolf shrinkage covariance",
                "kind": "correlation",
                "symbols": [],
                "matrix": [],
                "cluster_breaks": [],
            },
            "heatmap": {
                "symbols": [],
                "matrix": [],
                "cluster_breaks": [],
            },
        },
        "warnings": [note],
    }


def _pairwise_mean(corr: np.ndarray) -> float:
    if corr.shape[0] < 2:
        return 1.0
    upper = corr[np.triu_indices(corr.shape[0], k=1)]
    if upper.size == 0:
        return 1.0
    mean = float(np.nanmean(upper))
    return mean if np.isfinite(mean) else 0.0


def _cov_to_corr(cov: np.ndarray) -> np.ndarray:
    diag = np.sqrt(np.clip(np.diag(cov), 1e-12, None))
    outer = np.outer(diag, diag)
    corr = np.divide(cov, outer, out=np.zeros_like(cov), where=outer > 0)
    np.fill_diagonal(corr, 1.0)
    return np.clip(corr, -1.0, 1.0)


def _ledoit_wolf_cov(returns_df: pd.DataFrame) -> np.ndarray:
    estimator = LedoitWolf()
    estimator.fit(returns_df.to_numpy(dtype=float))
    return estimator.covariance_


def _compute_enb(weights: np.ndarray, corr: np.ndarray) -> float:
    if corr.size == 0:
        return 0.0
    normalized = np.asarray(weights, dtype=float)
    total = float(normalized.sum())
    if total <= 0:
        return 0.0
    normalized = normalized / total
    denom = float(normalized @ corr @ normalized)
    if denom <= 0:
        return float(corr.shape[0])
    return float(np.clip(1.0 / denom, 1.0, corr.shape[0]))


def _build_diversification_score(enb: float, holdings_count: int, hhi: float) -> float:
    if holdings_count <= 0:
        return 0.0
    return float(np.clip(100.0 * ((0.65 * (enb / holdings_count)) + (0.35 * (1.0 - hhi))), 0.0, 100.0))


def _ema_smoothed_score(returns_df: pd.DataFrame, weights: np.ndarray, holdings_count: int, hhi: float, short_window: int, span: int) -> float:
    if len(returns_df) < short_window:
        return 0.0

    raw_scores = []
    start_index = max(short_window - 1, len(returns_df) - span)
    for end_idx in range(start_index, len(returns_df)):
        window = returns_df.iloc[end_idx - short_window + 1 : end_idx + 1]
        cov = _ledoit_wolf_cov(window)
        corr = _cov_to_corr(cov)
        enb = _compute_enb(weights, corr)
        raw_scores.append(_build_diversification_score(enb, holdings_count, hhi))

    if not raw_scores:
        return 0.0
    return float(pd.Series(raw_scores).ewm(span=span, adjust=False).mean().iloc[-1])


def _is_defensive_symbol(symbol: str) -> bool:
    normalized = (symbol or "").upper()
    return any(keyword in normalized for keyword in DEFENSIVE_KEYWORDS)


def _cluster_label(symbols: list[str]) -> str:
    joined = " ".join(symbols).upper()
    for label, keywords in THEME_LABELS:
        if any(keyword in joined for keyword in keywords):
            return label
    if len(symbols) == 1:
        return symbols[0]
    return f"{symbols[0]} / {symbols[1]}"


def _cluster_groups(symbols: list[str], corr: np.ndarray, corr_threshold: float) -> np.ndarray:
    if len(symbols) <= 1:
        return np.array([1] * len(symbols), dtype=int)

    distance = np.sqrt(np.clip(2.0 * (1.0 - corr), 0.0, None))
    np.fill_diagonal(distance, 0.0)
    linkage_matrix = linkage(squareform(distance, checks=False), method="ward")
    distance_threshold = math.sqrt(max(0.0, 2.0 * (1.0 - corr_threshold)))
    return fcluster(linkage_matrix, t=distance_threshold, criterion="distance")


def _cluster_avg_corr(short_corr_df: pd.DataFrame, members: list[str], dominant_members: list[str] | None = None) -> float:
    if not members:
        return 0.0
    if dominant_members is None:
        subset = short_corr_df.loc[members, members].to_numpy(dtype=float)
        return round(_pairwise_mean(subset), 2)
    values = short_corr_df.loc[members, dominant_members].to_numpy(dtype=float)
    if values.size == 0:
        return 0.0
    return round(float(np.nanmean(values)), 2)


def _range_from_excess(excess: float) -> tuple[int, int]:
    center = max(2, int(round(excess)))
    lower = max(2, center - 3)
    upper = max(lower + 2, center + 1)
    return lower, upper


def _build_regime_series(returns_df: pd.DataFrame, short_window: int, long_window: int, points: int) -> list[dict]:
    if len(returns_df) < long_window:
        return []

    start = max(long_window - 1, len(returns_df) - points)
    rows = []
    for end_idx in range(start, len(returns_df)):
        short_cov = _ledoit_wolf_cov(returns_df.iloc[end_idx - short_window + 1 : end_idx + 1])
        long_cov = _ledoit_wolf_cov(returns_df.iloc[end_idx - long_window + 1 : end_idx + 1])
        short_corr = _cov_to_corr(short_cov)
        long_corr = _cov_to_corr(long_cov)
        short_avg = _pairwise_mean(short_corr)
        long_avg = _pairwise_mean(long_corr)
        rows.append({
            "date": pd.Timestamp(returns_df.index[end_idx]).strftime("%Y-%m-%d"),
            "short_corr": round(short_avg, 4),
            "long_corr": round(long_avg, 4),
            "delta": round(short_avg - long_avg, 4),
        })
    return rows


def _build_stressed_covariance(cov: np.ndarray, symbols: list[str]) -> np.ndarray:
    corr = _cov_to_corr(cov)
    equity_indices = [idx for idx, symbol in enumerate(symbols) if not _is_defensive_symbol(symbol)]
    stressed_corr = corr.copy()
    for i, left in enumerate(equity_indices):
        for right in equity_indices[i + 1 :]:
            stressed_corr[left, right] = 0.85
            stressed_corr[right, left] = 0.85
    np.fill_diagonal(stressed_corr, 1.0)

    vols = np.sqrt(np.clip(np.diag(cov), 1e-12, None))
    return np.diag(vols) @ stressed_corr @ np.diag(vols)


def _build_why_metrics(summary: dict) -> list[dict]:
    return [
        {
            "id": "diversification_score",
            "label": "Diversification Score",
            "value": round(summary["diversification_score"]),
            "suffix": "/ 100",
            "detail": summary["diversification_classification"],
            "tone": "amber" if summary["diversification_score"] >= 50 else "red",
        },
        {
            "id": "effective_bets",
            "label": "Effective Bets",
            "value": round(summary["portfolio_enb"], 1),
            "suffix": f"of {summary['usable_holdings']}",
            "detail": "Independent risk buckets left after correlation",
            "tone": "amber",
        },
        {
            "id": "top_cluster_exposure",
            "label": "Top Cluster Exposure",
            "value": round(summary["top_cluster_exposure"]),
            "suffix": "%",
            "detail": f"Top 2 clusters together are {round(summary['top_two_cluster_exposure'])}%",
            "tone": "red" if summary["top_cluster_exposure"] >= 35 else "amber",
        },
        {
            "id": "stress_risk_multiplier",
            "label": "Stress Risk Multiplier",
            "value": round(summary["stress_risk_multiplier"], 2),
            "suffix": "x",
            "detail": summary["stress_classification"],
            "tone": "red" if summary["stress_risk_multiplier"] >= 1.4 else "amber",
        },
        {
            "id": "correlation_regime_delta",
            "label": "Correlation Regime Delta",
            "value": round(summary["correlation_regime_delta"], 2),
            "suffix": "",
            "detail": summary["correlation_regime_classification"],
            "tone": "red" if summary["correlation_regime_delta"] >= 0.2 else "blue",
        },
    ]


def _build_enb_breakdown(clusters: list[dict]) -> list[dict]:
    rows = []
    for cluster in clusters:
        cluster_enb = float(cluster.get("enb") or 0.0)
        divisor = cluster_enb if cluster_enb > 0 else 1.0
        for symbol in cluster.get("symbols", []):
            weight_pct = float(symbol.get("weight_pct") or 0.0)
            rows.append({
                "symbol": symbol["symbol"],
                "cluster": cluster["name"],
                "weight_pct": round(weight_pct, 1),
                "cluster_enb": round(cluster_enb, 2),
                "enb_share": round(weight_pct / divisor, 2),
                "cluster_weight_pct": cluster["weight_pct"],
            })

    rows.sort(key=lambda row: (-row["enb_share"], -row["weight_pct"], row["symbol"]))
    return rows


def _insufficient_history_note(excluded: list[dict]) -> str:
    base = "Insufficient price history - fragility metrics may be unreliable."
    if not excluded:
        return base
    symbols = ", ".join(item["symbol"] for item in excluded[:5])
    return f"{base} Excluded holdings: {symbols}."


def _generate_actions(clusters: list[dict], stress_multiplier: float) -> tuple[str, list[dict]]:
    actions = []
    if not clusters:
        return "Structure Stable - No Rebalancing Required", actions

    dominant_cluster = clusters[0]
    top_two_weight = round(sum(cluster["weight_pct"] for cluster in clusters[:2]), 1)

    if top_two_weight >= 60:
        lower, upper = _range_from_excess(top_two_weight - 55)
        actions.append({
            "type": "TRIM",
            "title": f"Reduce {dominant_cluster['name']} by {lower}-{upper}%",
            "detail": f"Top 2 clusters now account for {top_two_weight:.1f}% of portfolio weight.",
            "tone": "red",
            "cluster_name": dominant_cluster["name"],
        })

    crowded_cluster = next((cluster for cluster in clusters if cluster["weight_pct"] >= 35), None)
    if crowded_cluster:
        actions.append({
            "type": "AVOID_ADDING",
            "title": f"No new positions in {crowded_cluster['name']}",
            "detail": f"{crowded_cluster['name']} already represents {crowded_cluster['weight_pct']:.1f}% of the portfolio, so new additions offer minimal diversification.",
            "tone": "amber",
            "cluster_name": crowded_cluster["name"],
        })

    defensive_clusters = [cluster for cluster in clusters if cluster["is_defensive"] and cluster["id"] != dominant_cluster["id"]]
    increase_needed = any(cluster["weight_pct"] <= 15 for cluster in defensive_clusters) or stress_multiplier >= 1.4
    if increase_needed:
        candidate_pool = defensive_clusters or [cluster for cluster in clusters if cluster["id"] != dominant_cluster["id"]]
        if candidate_pool:
            candidate = min(candidate_pool, key=lambda cluster: (cluster["avg_corr_to_dominant"], cluster["weight_pct"]))
            actions.append({
                "type": "INCREASE",
                "title": f"Increase allocation to {candidate['name']}",
                "detail": f"{candidate['name']} sits at {candidate['weight_pct']:.1f}% and is the lowest-correlation cluster versus the dominant risk bucket.",
                "tone": "green",
                "cluster_name": candidate["name"],
            })

    if not actions:
        return "Structure Stable - No Rebalancing Required", actions
    return "Rebalance Recommended", actions[:3]


def compute_fragility_overview(
    holdings_df: pd.DataFrame,
    history: dict[int, pd.DataFrame],
    cash_value: float = 0.0,
) -> dict:
    settings = get_settings()
    short_window = settings["short_window_days"]
    long_window = settings["long_window_days"]

    if holdings_df is None or holdings_df.empty:
        return _empty_result("No holdings found for fragility analysis.", settings)

    df = holdings_df.copy()
    required_columns = {"tradingsymbol", "quantity", "last_price", "instrument_token"}
    if not required_columns.issubset(df.columns):
        return _empty_result("Holdings payload is missing required fields for fragility analysis.", settings)

    df = df[df["quantity"].fillna(0) > 0].copy()
    if df.empty:
        return _empty_result("No active holdings found for fragility analysis.", settings)

    df["value"] = df["last_price"].fillna(0) * df["quantity"].fillna(0)
    total_holdings_value = float(df["value"].sum())
    if total_holdings_value <= 0:
        return _empty_result("Holdings have no positive market value.", settings)

    total_portfolio_value = total_holdings_value + max(float(cash_value or 0.0), 0.0)
    if total_portfolio_value > 0 and (cash_value / total_portfolio_value) > settings["cash_skip_threshold"]:
        return _empty_result("Portfolio primarily in cash - diversification analysis not applicable.", settings, mode="mostly_cash")

    weights_all = (df.set_index("tradingsymbol")["value"] / total_holdings_value).sort_values(ascending=False)
    total_holdings = int(len(weights_all))
    hhi_all = float(np.square(weights_all.to_numpy(dtype=float)).sum())

    if total_holdings <= settings["small_portfolio_holdings"]:
        simplified_metrics = [
            {
                "id": "hhi",
                "label": "HHI Concentration",
                "value": round(hhi_all, 2),
                "suffix": "",
                "detail": "Portfolio too small for meaningful fragility analysis",
                "tone": "amber",
            }
        ]
        result = _empty_result("Portfolio too small for meaningful fragility analysis.", settings, mode="small_portfolio", metrics=simplified_metrics)
        result["summary"].update({
            "total_holdings": total_holdings,
            "usable_holdings": total_holdings,
            "hhi": round(hhi_all, 4),
        })
        return result

    returns_map: dict[str, pd.Series] = {}
    excluded = []

    for _, row in df.iterrows():
        symbol = row["tradingsymbol"]
        hist = history.get(row.get("instrument_token"))
        if hist is None or hist.empty or "close" not in hist:
            excluded.append({"symbol": symbol, "weight_pct": round(float(weights_all.get(symbol, 0.0)) * 100, 1)})
            continue

        closes = (
            hist.sort_values("date")
            .set_index("date")["close"]
            .astype(float)
            .replace(0, np.nan)
            .dropna()
            .tail(long_window + 1)
        )
        if len(closes) < long_window + 1:
            excluded.append({"symbol": symbol, "weight_pct": round(float(weights_all.get(symbol, 0.0)) * 100, 1)})
            continue

        log_returns = np.log(closes).diff().dropna()
        returns_map[symbol] = log_returns

    if not returns_map:
        return _empty_result(
            _insufficient_history_note(excluded),
            settings,
            mode="insufficient_history",
        )

    returns_df = pd.concat(returns_map, axis=1).dropna(how="any")
    if len(returns_df) < long_window:
        return _empty_result(
            _insufficient_history_note(excluded),
            settings,
            mode="insufficient_history",
        )

    usable_symbols = list(returns_df.columns)
    usable_weights = weights_all.reindex(usable_symbols).fillna(0.0)
    usable_weights = usable_weights / usable_weights.sum()
    weight_vector = usable_weights.to_numpy(dtype=float)
    usable_count = int(len(usable_symbols))
    hhi = float(np.square(weight_vector).sum())

    short_returns = returns_df.tail(short_window)
    long_returns = returns_df.tail(long_window)

    short_cov = _ledoit_wolf_cov(short_returns)
    long_cov = _ledoit_wolf_cov(long_returns)
    short_corr = _cov_to_corr(short_cov)
    long_corr = _cov_to_corr(long_cov)

    enb = _compute_enb(weight_vector, short_corr)
    diversification_score = _ema_smoothed_score(
        returns_df=returns_df,
        weights=weight_vector,
        holdings_count=usable_count,
        hhi=hhi,
        short_window=short_window,
        span=settings["diversification_ema_span"],
    )

    cluster_ids = _cluster_groups(usable_symbols, short_corr, settings["cluster_corr_threshold"])
    cluster_map: dict[int, list[str]] = {}
    for symbol, cluster_id in zip(usable_symbols, cluster_ids, strict=False):
        cluster_map.setdefault(int(cluster_id), []).append(symbol)

    short_corr_df = pd.DataFrame(short_corr, index=usable_symbols, columns=usable_symbols)
    cluster_entries = []
    for cluster_id, members in cluster_map.items():
        members = sorted(members, key=lambda symbol: (-float(usable_weights.get(symbol, 0.0)), symbol))
        cluster_weights = usable_weights.reindex(members).fillna(0.0)
        cluster_corr = short_corr_df.loc[members, members].to_numpy(dtype=float)
        cluster_weight_pct = float(cluster_weights.sum() * 100.0)
        cluster_entries.append({
            "id": cluster_id,
            "name": _cluster_label(members),
            "weight_pct": round(cluster_weight_pct, 1),
            "enb": round(_compute_enb(cluster_weights.to_numpy(dtype=float), cluster_corr), 2),
            "avg_corr": round(_pairwise_mean(cluster_corr), 2),
            "size": len(members),
            "is_defensive": bool(cluster_weights.reindex([symbol for symbol in members if _is_defensive_symbol(symbol)]).sum() >= cluster_weights.sum() * 0.5),
            "symbols": [
                {
                    "symbol": symbol,
                    "weight_pct": round(float(usable_weights.get(symbol, 0.0)) * 100.0, 1),
                    "value": round(float(df.loc[df["tradingsymbol"] == symbol, "value"].iloc[0]), 2),
                }
                for symbol in members
            ],
        })

    cluster_entries.sort(key=lambda cluster: (-cluster["weight_pct"], -cluster["size"], cluster["name"]))
    dominant_members = [item["symbol"] for item in cluster_entries[0]["symbols"]] if cluster_entries else []
    for idx, cluster in enumerate(cluster_entries, start=1):
        cluster["id"] = idx
        cluster["avg_corr_to_dominant"] = _cluster_avg_corr(
            short_corr_df,
            [item["symbol"] for item in cluster["symbols"]],
            dominant_members if idx != 1 else None,
        )

    ordered_symbols = []
    cluster_breaks = []
    for cluster in cluster_entries:
        if ordered_symbols:
            cluster_breaks.append(len(ordered_symbols))
        ordered_symbols.extend([item["symbol"] for item in cluster["symbols"]])

    ordered_corr = short_corr_df.reindex(index=ordered_symbols, columns=ordered_symbols)
    heatmap_matrix = ordered_corr.round(4).to_numpy(dtype=float).tolist()
    avg_short_corr = _pairwise_mean(short_corr)
    avg_long_corr = _pairwise_mean(long_corr)
    regime_delta = float(avg_short_corr - avg_long_corr)

    strongest_pair = {"symbols": [], "corr": 0.0}
    if usable_count > 1:
        best_value = -1.0
        best_pair = ()
        for i, left in enumerate(ordered_symbols):
            for right in ordered_symbols[i + 1 :]:
                value = float(short_corr_df.loc[left, right])
                if value > best_value:
                    best_value = value
                    best_pair = (left, right)
        strongest_pair = {"symbols": list(best_pair), "corr": round(best_value, 2)}

    current_risk = float(math.sqrt(max(weight_vector @ short_cov @ weight_vector, 0.0)))
    stressed_cov = _build_stressed_covariance(short_cov, usable_symbols)
    stressed_risk = float(math.sqrt(max(weight_vector @ stressed_cov @ weight_vector, 0.0)))
    stress_multiplier = float(stressed_risk / current_risk) if current_risk > 0 else 0.0

    top_cluster_exposure = round(cluster_entries[0]["weight_pct"], 1) if cluster_entries else 0.0
    top_two_cluster_exposure = round(sum(cluster["weight_pct"] for cluster in cluster_entries[:2]), 1)
    summary = {
        "mode": "ok",
        "total_holdings": total_holdings,
        "usable_holdings": usable_count,
        "portfolio_enb": round(enb, 2),
        "diversification_score": round(diversification_score, 1),
        "diversification_classification": _classification(diversification_score),
        "hhi": round(hhi, 4),
        "top_cluster_exposure": top_cluster_exposure,
        "top_two_cluster_exposure": top_two_cluster_exposure,
        "largest_cluster_weight": cluster_entries[0]["weight_pct"] if cluster_entries else 0.0,
        "cluster_count": len(cluster_entries),
        "stress_risk_multiplier": round(stress_multiplier, 2),
        "stress_classification": _stress_classification(stress_multiplier),
        "correlation_regime_delta": round(regime_delta, 2),
        "correlation_regime_classification": _regime_classification(regime_delta),
        "avg_pairwise_corr_short": round(avg_short_corr, 2),
        "avg_pairwise_corr_long": round(avg_long_corr, 2),
        "short_window_days": short_window,
        "long_window_days": long_window,
        "strongest_pair": strongest_pair,
        "matrix_method": "Ledoit-Wolf shrinkage covariance",
        "status_message": "",
    }

    hero_title, hero_actions = _generate_actions(cluster_entries, stress_multiplier)
    summary["status_message"] = hero_title

    excluded_weight_pct = round(sum(item["weight_pct"] for item in excluded), 1)
    warnings = []
    if excluded:
        prefix = "Insufficient price history - fragility metrics may be unreliable."
        if excluded_weight_pct > (settings["missing_data_warning_weight"] * 100):
            warnings.append(
                f"{prefix} Excluded {len(excluded)} holding(s) representing {excluded_weight_pct:.1f}% of the portfolio."
            )
        else:
            warnings.append(
                f"Excluded {len(excluded)} holding(s) with insufficient price history: {', '.join(item['symbol'] for item in excluded[:5])}."
            )

    why_metrics = _build_why_metrics(summary)
    enb_breakdown = _build_enb_breakdown(cluster_entries)
    evidence = {
        "collapsed_by_default": True,
        "show": True,
        "gauge": {
            "enb": round(enb, 2),
            "holdings": usable_count,
            "fill_pct": round((enb / usable_count) * 100.0, 1) if usable_count else 0.0,
        },
        "clusters": cluster_entries,
        "enb_breakdown": enb_breakdown,
        "cluster_bars": [
            {
                "name": cluster["name"],
                "weight_pct": cluster["weight_pct"],
                "avg_corr": cluster["avg_corr"],
                "enb": cluster["enb"],
                "is_defensive": cluster["is_defensive"],
            }
            for cluster in cluster_entries
        ],
        "correlation_regime": {
            "short_corr": round(avg_short_corr, 2),
            "long_corr": round(avg_long_corr, 2),
            "delta": round(regime_delta, 2),
            "status": _regime_classification(regime_delta),
            "series": _build_regime_series(returns_df, short_window, long_window, settings["regime_chart_points"]),
        },
        "stress": {
            "current_risk": round(current_risk, 4),
            "stressed_risk": round(stressed_risk, 4),
            "multiplier": round(stress_multiplier, 2),
            "status": _stress_classification(stress_multiplier),
        },
        "matrix": {
            "method": "Ledoit-Wolf shrinkage covariance",
            "kind": "correlation",
            "symbols": ordered_symbols,
            "matrix": heatmap_matrix,
            "cluster_breaks": cluster_breaks,
        },
        "heatmap": {
            "symbols": ordered_symbols,
            "matrix": heatmap_matrix,
            "cluster_breaks": cluster_breaks,
        },
    }

    return {
        "summary": summary,
        "hero": {
            "title": hero_title,
            "actions": hero_actions,
            "show_actions": bool(hero_actions),
        },
        "why": {
            "metrics": why_metrics,
        },
        "evidence": evidence,
        "warnings": warnings,
    }
