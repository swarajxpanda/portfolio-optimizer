DEFAULT = {
    "short_window_days": 90,
    "long_window_days": 252,
    "diversification_ema_span": 7,
    "cluster_corr_threshold": 0.6,
    "small_portfolio_holdings": 8,
    "cash_skip_threshold": 0.8,
    "missing_data_warning_weight": 0.10,
    "regime_chart_points": 30,
}


def get_settings():
    return DEFAULT.copy()
