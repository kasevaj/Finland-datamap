
DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
    code TEXT PRIMARY KEY,
    name TEXT,
    population INTEGER,
    coordinates TEXT
);