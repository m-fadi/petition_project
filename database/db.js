const spicedPg = require("spiced-pg");
require("dotenv").config();
const { USER, PASSWORD, DATABASE } = process.env;

// this establishes the connection to the db
// it get's a connection string as an argument
const db = spicedPg(`postgres:${USER}:${PASSWORD}@localhost:5432/${DATABASE}`);

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

function getUserByEmail(email) {
    return db
        .query("SELECT * FROM users WHERE email = $1", [email])
        .then((result) => result.rows[0])
        .catch((error) => console.log("XXXXXXXXXX",error));
}

function createUser({ firstName, lastName, email, password, created_at }) {
    return db
        .query(
            `INSERT INTO users (firstName, lastName, email,password,created_at)
    VALUES ($1, $2, $3,$4,$5)
    RETURNING *`,
            [firstName, lastName, email, password, created_at]
        )
        .then((result) => {
           // console.log(result.rows[0]);
            return result.rows[0];
            //var userId = result.rows[0].id;
            //var userId = result.rows[0].id;
        })
        .catch((error) => {
            console.log(error);
        });
}

function createSignatures({ userId, signature }) {
    //console.log("sig in db",signature)
    return db
        .query(
            `INSERT INTO signatures (userId, signature)
    VALUES ($1, $2)
    RETURNING *`,
            [userId, signature]
        )
        .then((result) => {
            //console.log(result.rows[0]);
            return result.rows[0];
            //var userId = result.rows[0].id;
            //var userId = result.rows[0].id;
        })
        .catch((error) => {
            console.log(error);
        });
}

function createUserProfile({ user_id, age,city,homepage }) {
    //console.log("sig in db",signature)
    return db
        .query(
            `INSERT INTO users_profiles(user_id, age,city,homepage)
    VALUES ($1, $2, $3,$4 )
    RETURNING *`,
            [user_id, age,city,homepage]
        )
        .then((result) => {
            console.log(result.rows[0]);
            return result.rows[0];
            //var userId = result.rows[0].id;
            //var userId = result.rows[0].id;
        })
        .catch((error) => {
            console.log(error);
        });
}
module.exports = {
    createUser,
    createSignatures,
    getProfiles,
    getName,
    getUserByEmail,
    createUserProfile,
};
