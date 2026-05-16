from __future__ import annotations

import copy
import json
import sqlite3
from collections.abc import Callable
from typing import Any

DB_PATH = "settings.db"


def _connect() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def _ensure_table(conn: sqlite3.Connection, table_name: str) -> None:
    conn.execute(f"CREATE TABLE IF NOT EXISTS {table_name} (id INTEGER PRIMARY KEY, config TEXT)")


def load_settings(table_name: str, defaults: dict[str, Any]) -> dict[str, Any]:
    with _connect() as conn:
        _ensure_table(conn, table_name)
        row = conn.execute(f"SELECT config FROM {table_name} WHERE id=1").fetchone()

    return json.loads(row[0]) if row else copy.deepcopy(defaults)


def save_settings(
    table_name: str,
    config: dict[str, Any],
    normalizer: Callable[[dict[str, Any]], dict[str, Any]] | None = None,
) -> None:
    payload = normalizer(copy.deepcopy(config)) if normalizer else copy.deepcopy(config)

    with _connect() as conn:
        _ensure_table(conn, table_name)
        conn.execute(
            f"INSERT INTO {table_name} (id, config) VALUES (1, ?) "
            "ON CONFLICT(id) DO UPDATE SET config = excluded.config",
            (json.dumps(payload),),
        )


def reset_settings(table_name: str, defaults: dict[str, Any]) -> dict[str, Any]:
    with _connect() as conn:
        _ensure_table(conn, table_name)
        conn.execute(f"DELETE FROM {table_name} WHERE id=1")

    return copy.deepcopy(defaults)
