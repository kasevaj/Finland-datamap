import sqlite3
import json

conn = sqlite3.connect("cities.db")
cursor = conn.cursor()
cursor.execute("DELETE FROM cities")

with open("database/schema.sql") as s:
    cursor.executescript(s.read())

with open("joined.json", "r", encoding="utf-8") as f:
    data = json.load(f)  # data is a dict keyed by code

for code, city in data.items():
    cursor.execute(
        "INSERT INTO cities (code, name, population, coordinates) VALUES (?, ?, ?, ?)",
        (code, city["name"], city["population"], json.dumps(city["coordinates"]))
    )

# katsotaan mitä tietokannassa näkyy
cursor.execute("SELECT * FROM cities LIMIT 10")
rows = cursor.fetchall()

for row in rows:
    code, name, population, coords_json = row
    coords = json.loads(coords_json)  # convert JSON string back to list
    num_polygons = len(coords)
    print(f"{code}: {name}, population {population}, number of polygons: {num_polygons}")

conn.commit()
conn.close()