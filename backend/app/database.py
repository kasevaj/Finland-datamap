import sqlite3
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(ROOT, "cities.db")
SCHEMA_PATH = os.path.join(ROOT, "database", "schema.sql")
JOINED_PATH = os.path.join(ROOT, "joined.json")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

with open(SCHEMA_PATH) as s:
    cursor.executescript(s.read())

with open(JOINED_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

for code, city in data.items():
    cursor.execute(
        "INSERT INTO cities (code, name, population, coordinates) VALUES (?, ?, ?, ?)",
        (code, city["name"], city["population"], json.dumps(city["coordinates"]))
    )

conn.commit()
conn.close()
print(f"Loaded {len(data)} municipalities into {DB_PATH}")
