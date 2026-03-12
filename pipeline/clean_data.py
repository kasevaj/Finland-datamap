# join tilastokeskus and maanmittauslaitos datasets
# halutaan yhdistää kuntakoodin perusteella, eli key = koodi, ja value = {city, population, coordinates}
import json

with open("population.json") as p:
    pop_dict = json.load(p)  # list of dicts with city, area_code, population

with open("borders.json") as f:
    mml_data = json.load(f) 


joined_dict={}

for code, feature in mml_data.items():
    if code.startswith("SSS"):
        continue
    if code in pop_dict:
        joined_dict[code] = {
            "name": pop_dict[code]["name"],
            "population": pop_dict[code]["population"],
            "coordinates": feature["coordinates"]
        }
for k, v in list(joined_dict.items())[:3]:
    print(k, v)

with open("joined.json", "w", encoding="utf-8") as f:
    json.dump(joined_dict, f, ensure_ascii=False, indent=2)