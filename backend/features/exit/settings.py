from core.settings_store import (
    load_settings,
    reset_settings as reset_stored_settings,
    save_settings as save_stored_settings,
)

DEFAULT = {
    "action_thresholds": {
        "EXIT": 70,
        "TRIM": 50,
        "WATCH": 30,
    },
    "function_scores": {
        "loss_severity": [5, 10, 18, 25],
        "risk_vs_median": [8, 14, 20],
        "risk_adj_inefficiency": [8, 14, 20],
        "trend_weakness": [10, 20],
        "concentration": [5, 10, 15],
    },
}


def get_settings():
    return load_settings("exit_settings", DEFAULT)


def save_settings(config: dict):
    save_stored_settings("exit_settings", config)


def reset_settings():
    return reset_stored_settings("exit_settings", DEFAULT)
