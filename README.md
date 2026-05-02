# Finland Population Map

An interactive map visualizing population data for Finnish municipalities. Population figures are fetched from Statistics Finland and municipality borders from the National Land Survey of Finland (Maanmittauslaitos).

## Project structure

```
finland_population_map/
├── pipeline/           # Data fetching and processing scripts
│   ├── fetch_population.py   # Pulls data from Statistics Finland API
│   ├── fetch_borders.py      # Pulls municipality borders from MML API
│   └── clean_data.py         # Merges population + border data → joined.json
├── backend/            # Python API server (Flask)
│   ├── app/
│   │   ├── main.py     # App entry point
│   │   ├── routes.py   # API endpoints
│   │   ├── models.py   # Data models
│   │   └── database.py # DB connection and setup
│   └── requirements.txt
├── frontend/           # React + Leaflet web app (Vite)
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── Map.jsx
│           └── Filter.jsx
├── database/
│   └── schema.sql      # SQLite schema
├── scripts/
│   └── update_data.py  # Orchestrates full pipeline run
└── data/raw/           # Raw data (not committed)
```

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Maanmittauslaitos API key](https://www.maanmittauslaitos.fi/rajapinnat/api-avaimen-ohje)

### Environment variables

Copy `.env.example` to `.env` and fill in your API key:

```bash
cp .env.example .env
```

### Backend / pipeline dependencies

```bash
pip install -r backend/requirements.txt
pip install -r pipeline/requirements.txt
```

### Frontend dependencies

```bash
cd frontend
npm install
```

## Running the data pipeline

Run these scripts from the project root in order:

```bash
python pipeline/fetch_population.py   # → population.json
python pipeline/fetch_borders.py      # → borders.json
python pipeline/clean_data.py         # → joined.json
python backend/app/database.py        # → cities.db
```

## Running the application

**Backend** (from project root):

```bash
python backend/app/main.py
```

**Frontend** (from `frontend/`):

```bash
npm run dev
```

## Data sources

- **Population**: [Statistics Finland PX-Web API](https://pxdata.stat.fi/) — municipality-level population
- **Borders**: [Maanmittauslaitos open geodata API](https://www.maanmittauslaitos.fi/kartat-ja-paikkatieto/asiantuntevalle-kayttajalle/tuotekuvaukset/maastotiedot) — municipality polygon geometries
