
DROP TABLE IF EXISTS cities;

CREATE TABLE IF NOT EXISTS cities (
    code TEXT PRIMARY KEY,
    name TEXT,
    population INTEGER,
    coordinates TEXT
);