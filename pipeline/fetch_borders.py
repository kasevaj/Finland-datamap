import os
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

url = "https://avoin-paikkatieto.maanmittauslaitos.fi/maastotiedot/features/v1/collections/kunta/items"
api_key = os.environ.get("MML_API_KEY")
if not api_key:
    raise EnvironmentError("MML_API_KEY not set. Copy .env.example to .env and fill in your key.")
auth = (api_key, "")

r = requests.get(url, auth=auth)
r.raise_for_status()
data = r.json()
print(r.status_code)

city_border_dict = {}

for feature in data["features"]:
    props = feature["properties"]
    code = props["kuntatunnus"]     
    code = str(code).zfill(3)     # municipality code
    name = props.get("nimi", "")          # municipality name
    coords = feature["geometry"]["coordinates"]  # the polygon coordinates

    city_border_dict[code] = {
        "name": name,
        "coordinates": coords
    }

for k, v in list(city_border_dict.items())[:3]:
    print(k, v["name"], "Number of polygons:", len(v["coordinates"]))

df = pd.DataFrame.from_dict(city_border_dict, orient='index')
df.to_json("borders.json", orient="index", force_ascii=False, indent=2)