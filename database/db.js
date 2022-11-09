const spicedPg = require("spiced-pg");
const user = "fadoo";
const password = "beshraghi";
const database = "petition";

// this establishes the connection to the db
// it get's a connection string as an argument
const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);

function getProfiles() {
    return db.query("SELECT * FROM users").then((result) => result.rows);
}
// function CountUsers() {
//     return db
//         .query("SELECT count(*) FROM users ")
//         .then((result) => result.rows[0]);
// }
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
            return result.rows[0];
            //var userId = result.rows[0].id;
              //var userId = result.rows[0].id;
             //console.log(result.rows[0].id)
        });
}

module.exports = {
    createProfile,
    getProfiles,
    getName,
    
    
};
