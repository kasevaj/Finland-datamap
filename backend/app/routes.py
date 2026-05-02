import sqlite3
import json
import os
from flask import Blueprint, jsonify

api = Blueprint("api", __name__)

DB_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "cities.db")
)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@api.route("/api/cities")
def get_cities():
    if not os.path.exists(DB_PATH):
        return jsonify({"error": "Database not found. Run the data pipeline first."}), 503
    conn = None
    try:
        conn = get_db()
        rows = conn.execute(
            "SELECT code, name, population FROM cities"
        ).fetchall()
        return jsonify([
            {"code": row["code"], "name": row["name"], "population": row["population"]}
            for row in rows
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
