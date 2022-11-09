const spicedPg = require("spiced-pg");

// this establishes the connection to the db
// it get's a connection string as an argument
const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);

function getProfiles() {
    return db.query("SELECT * FROM users").then((result) => result.rows);
}

function getName(name) {
    return db
        .query("SELECT * FROM users WHERE name = $1", [name])
        .then((result) => result.rows[0]);
}

function createProfile({ firstName, lastName }) {
    return db
        .query(
            `INSERT INTO users (firstName, lastName)
    VALUES ($1, $2)
    RETURNING *`,
            [firstName, lastName]
        )
        .then((result) => {
            result.rows[0];
        });
}

module.exports = {
    createProfile,
    getProfiles,
    getName,
};
