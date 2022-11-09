const spicedPg = require("spiced-pg");

const user = "fadoo";
const password = "beshraghi";
const database = "petition";
// this establishes the connection to the db
// it get's a connection string as an argument
const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);

function getProfiles() {
    return db
        .query("SELECT * FROM cities")
        .then((result) => console.log(result.rows));
}

function getName(name) {
    return db
        .query("SELECT * FROM cities WHERE name = $1", [name])
        .then((result) => result.rows[0]);
}

function createProfile({ firstName, lastName, signature }) {
    return db
        .query(
            `INSERT INTO cities (firstName, lastName, signature)
    VALUES ($1, $2, $3)
    RETURNING *`,
            [firstName, lastName, signature]
        )
        .then((result) => result.rows[0]);
}

module.exports = {
    createProfile,
    getProfiles,
    getName,
};
