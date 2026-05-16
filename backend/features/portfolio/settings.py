from core.settings_store import (
    load_settings,
    reset_settings as reset_stored_settings,
    save_settings as save_stored_settings,
)

DEFAULT = {
    "groups": {
        "Metals": [],
        "US Equity": [],
        "Indian Equity ETF": [],
        "Indian Equity": [],
    },
    "targets": {
        "Metals": [15, 18],
        "US Equity": [15, 18],
        "Indian Equity ETF": [20, 24],
        "Indian Equity": [40, 50],
    },
    "concentration": {
        "top5": 35,
        "single": 5,
    },
}


def get_settings():
    return load_settings("settings", DEFAULT)


def _normalize_settings(config: dict):
    for group in config.get("groups", {}):
        if group not in config.get("targets", {}):
            config["targets"][group] = [0, 0]

    stale_targets = [group for group in config.get("targets", {}) if group not in config.get("groups", {})]
    for group in stale_targets:
        del config["targets"][group]

    return config


def save_settings(config: dict):
    save_stored_settings("settings", config, normalizer=_normalize_settings)


def reset_settings():
    return reset_stored_settings("settings", DEFAULT)
