DROP TABLE IF EXISTS users;

CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     firstName VARCHAR NOT NULL CHECK (firstName != ''),
     lastName VARCHAR NOT NULL CHECK (lastName != ''),
     signature VARCHAR NOT NULL CHECK (signature != '')
);