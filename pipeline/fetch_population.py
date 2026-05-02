import requests
import pandas as pd


url = "https://pxdata.stat.fi/PXWeb/api/v1/fi/StatFin/muutl/statfin_muutl_pxt_11ae.px"

query = {
  "query": [
    { "code": "Vuosi", "selection": { "filter": "top", "values": ["1"] }},
    { "code": "Alue", "selection": { "filter": "all", "values": ["*"] }},
    { "code": "Tiedot", "selection": { "filter": "item", "values": ["vaesto"] }}
  ],
  "response": { "format": "json-stat" }
}

r = requests.post(url, json=query)
r.raise_for_status()
data = r.json()
print(r.status_code)

areas = list(data["dataset"]["dimension"]["Alue"]["category"]["label"].values())
codes = list(data["dataset"]["dimension"]["Alue"]["category"]["label"].keys())
pops = data["dataset"]["value"]

city_pop_dict = {
    code[2:]: {"name": name, "population": pop}
    for code, name, pop in zip(codes, areas, pops)
}
df = pd.DataFrame.from_dict(city_pop_dict, orient='index')
print(df)
df.to_json("population.json", orient="index", force_ascii=False, indent=2)


