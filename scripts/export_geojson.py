"""
Export cities.db → frontend/public/municipalities.geojson
                 → frontend/public/finland_outline.geojson

Coordinates are simplified (tolerance=0.001°, ~100m) to cut file size by ~90%.
Run once after the pipeline, or whenever the database is refreshed.
"""
import sqlite3
import json
import os
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import unary_union, transform

try:
    from shapely import set_precision as _set_precision
    def snap_geom(geom):
        return _set_precision(geom, grid_size=0.001)
except ImportError:
    def snap_geom(geom):
        return transform(lambda x, y: (round(x, 3), round(y, 3)), geom)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "cities.db")
OUTPUT = os.path.join(ROOT, "frontend", "public", "municipalities.geojson")
OUTLINE_OUTPUT = os.path.join(ROOT, "frontend", "public", "finland_outline.geojson")

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
rows = conn.execute(
    "SELECT code, name, population, coordinates FROM cities"
).fetchall()
conn.close()

features = []
geoms = []
skipped = 0

for row in rows:
    coords = json.loads(row["coordinates"])
    is_multi = isinstance(coords[0][0][0], list)
    raw_geom = {
        "type": "MultiPolygon" if is_multi else "Polygon",
        "coordinates": coords,
    }
    geom = snap_geom(shape(raw_geom)).simplify(tolerance=0.001, preserve_topology=True)
    if geom.is_empty:
        skipped += 1
        continue
    geoms.append(geom)
    features.append({
        "type": "Feature",
        "geometry": mapping(geom),
        "properties": {
            "code": row["code"],
            "name": row["name"],
            "population": row["population"],
        },
    })

# municipalities
geojson = {"type": "FeatureCollection", "features": features}
with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, separators=(",", ":"))

size_mb = os.path.getsize(OUTPUT) / 1_000_000
print(f"Wrote {len(features)} municipality features to {OUTPUT} ({size_mb:.1f} MB)")

# Finland outer outline — holes stripped so the border layer has no interior rings
def remove_holes(geom):
    if geom.geom_type == 'Polygon':
        return Polygon(geom.exterior)
    elif geom.geom_type == 'MultiPolygon':
        return MultiPolygon([Polygon(p.exterior) for p in geom.geoms])
    return geom

finland = remove_holes(unary_union(geoms))
outline_geojson = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": mapping(finland),
        "properties": {},
    }],
}
with open(OUTLINE_OUTPUT, "w", encoding="utf-8") as f:
    json.dump(outline_geojson, f, ensure_ascii=False, separators=(",", ":"))

outline_mb = os.path.getsize(OUTLINE_OUTPUT) / 1_000_000
print(f"Wrote Finland outline to {OUTLINE_OUTPUT} ({outline_mb:.1f} MB)")
if skipped:
    print(f"Skipped {skipped} empty geometries")
