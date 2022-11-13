const spicedPg = require("spiced-pg");
require("dotenv").config();
const { USER, PASSWORD, DATABASE } = process.env;

// this establishes the connection to the db
// it get's a connection string as an argument
const db = spicedPg(`postgres:${USER}:${PASSWORD}@localhost:5432/${DATABASE}`);

function updateUser(id) {
    return db
        .query(`DELETE FROM users_profiles WHERE users_profiles.user_id=$1`,[id])
        .then();
       // .query(` select from users_profiles where `)
        
}
function getProfile(id) {
    return db.query("SELECT * FROM users where id=users.id").then((result) => {
        //console.log(result.rows[0])
    return result.rows[0]
});
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
        .catch((error) => console.log("XXXXXXXXXX", error));
}

function createUser({ firstName, lastName, email, password, created_at }) {
    return db // HOW TO CHECK IF THE USERId already exist in the table????
        .query(
            `INSERT INTO users (firstName, lastName, email,password,created_at)
    VALUES ($1, $2, $3,$4,$5)
    RETURNING *`,
            [firstName, lastName, email, password, created_at]
        )
        .then((result) => {
           
            return result.rows[0];
        
        })
        .catch((error) => {
            console.log(error);
        });
}

function createSignatures({ userId, signature }) {
    // HOW TO CHECK IF THE USERId already exist in the table????
    return db
        .query(
            `INSERT INTO signatures (userId, signature)
    VALUES ($1, $2)
    RETURNING *`,
            [userId, signature]
        )
        .then((result) => {

            return result.rows[0];

        })
        .catch((error) => {
            console.log(error);
        });
}
function getSignature(userId){
    console.log(userId)
     return db
        .query("SELECT * FROM signatures WHERE signatures.userid = $1", [userId])
        .then((result) => {
            if (result.rowCount===0) return 0
            //console.log("no user",typeof(result),result);
            return result.rows[0]
        }).catch(error=>console.log("no user",error))

}

function createUserProfile({ user_id, age, city, homepage }) {

    return db
        .query(
            `INSERT INTO users_profiles(user_id, age,city,homepage)
    VALUES ($1, $2, $3,$4 )
    RETURNING *`,
            [user_id, age, city, homepage]
        )
        .then((result) => {
            //console.log(result.rows[0]);
            return result.rows[0];

        })
        .catch((error) => {
            console.log(error);
        });
}

function createDataTable() {
    

    return db
        .query(
            "SELECT users.firstname, users.lastname, users_profiles.age, users_profiles.city FROM users JOIN users_profiles ON users.id = users_profiles.user_id"
        )
        // .query(
        //     `SELECT users.firstname AS first, users.lastname AS last , users_profiles.city As user_city,users_profiles.age as user_age

        //     FROM users
        //         JOIN users_profiles
        //         ON users.id = users_profiles.user_id;`,
        //     [userId, age, city, firstname, lastname]
        // )
        .then((result) => {
           
            return result.rows;
        })
        .catch((error) => {
            console.log(error);
        });
}
module.exports = {
    createUser,
    createSignatures,
    getProfile,
    getName,
    getUserByEmail,
    createUserProfile,
    createDataTable,
    updateUser,
    getSignature,
};
