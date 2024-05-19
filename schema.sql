CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    email TEXT UNIQUE,
    password TEXT,
    status TEXT DEFAULT 'Pending'
);