"""Run the full data pipeline from the project root."""
import subprocess
import sys
import os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)

steps = [
    "pipeline/fetch_population.py",
    "pipeline/fetch_borders.py",
    "pipeline/clean_data.py",
    "backend/app/database.py",
    "scripts/export_geojson.py",
]

for script in steps:
    print(f"\n=== {script} ===")
    subprocess.run([sys.executable, script], check=True)

print("\nDone.")
