const spicedPg = require("spiced-pg");
require("dotenv").config();
const { USER, PASSWORD, DATABASE } = process.env;

// this establishes the connection to the db
// it get's a connection string as an argument
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${USER}:${PASSWORD}@localhost:5432/${DATABASE}`
);

function deleteUser(id) {
    return db.query(`DELETE FROM users WHERE id=$1`, [id]).then();

    // .query(` select from users_profiles where `)
}

function deleteUser_profile(id) {
    return db
        .query(`DELETE FROM users_profiles WHERE users_profiles.user_id=$1`, [
            id,
        ])
        .then();
}

function deleteSignature(id) {
    return db.query(`DELETE FROM signatures WHERE userid=$1`, [id]).then();
}

function getProfile(id) {
    return db
        .query("SELECT * FROM users_profiles where user_id=$1", [id])
        .then((result) => {
            //console.log("userProfile from getProfile",result.rows[0])
            return result.rows[0];
        });
}

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
            // ` INSERT INTO users(firstname, lastname, email, password, created_at)
            // VALUES ($1, $2, $3,$4,$5)
            // ON CONFLICT (id)
            // DO UPDATE SET firstname=$1,lastname=$2,email=$3,password=$4,created_at=$5
            // RETURNING *`,
            // [firstName, lastName, email, password, created_at]
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
function getSignature(userId) {
    //console.log(userId);
    return db
        .query("SELECT * FROM signatures WHERE signatures.userid = $1", [
            userId,
        ])
        .then((result) => {
            if (result.rowCount === 0) return 0;
            return result;
        })
        .catch((error) => console.log("no user", error));
}

function CountSigners() {
    return db.query("SELECT count(*) FROM signatures ").then((result) => {
        console.log("countSigners at db", result.rows[0]);
        return result.rows[0];
    });
}

function createUserProfile({ user_id, age, cityUpper, homepage }) {
    return db
        .query(
            `INSERT INTO users_profiles(user_id, age,city,homepage)
            VALUES ($1, $2, $3,$4 )
            RETURNING *`,
            [user_id, age, cityUpper, homepage]
            // ` INSERT INTO users_profiles(user_id,age,city,homepage)
            // VALUES ($1, $2, $3,$4)
            // ON CONFLICT (user_id)
            // DO UPDATE SET age=$1,city=$2,homepage=$3
            // RETURNING *`,
            // [user_id, age, city, homepage]
        )
        .then((result) => {
            return result.rows[0];
        })
        .catch((error) => {
            console.log(error);
        });
}

function createDataTable() {
    return db
        .query(
            "SELECT users.firstname, users.lastname, users_profiles.age, users_profiles.city, users_profiles.homepage FROM users JOIN users_profiles ON users.id = users_profiles.user_id"
        )
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log(error);
        });
}

function getSignersByCity(city) {
    return db
        .query(
            `SELECT users.firstname, users.lastname, users_profiles.age, users_profiles.city, users_profiles.homepage FROM users JOIN users_profiles ON users.id = users_profiles.user_id where city=$1 `,
            [city]
        )
        .then((result) => {
            console.log("signers at db by city", result.rows);
            return result.rows; 
        });
}

function updateUserProfile({ age, cityUpper, homepage, user_id }) {
    return db.query(
        ` INSERT INTO users_profiles(age,city,homepage,user_id) 
    VALUES ($1, $2, $3,$4) 
    ON CONFLICT (user_id) 
    DO UPDATE SET age=$1,city=$2,homepage=$3 
    RETURNING *`,
        [age, cityUpper, homepage, user_id]
    );
}

function updateUserInfo({ firstName, lastName, email, user_id }) {
    console.log(firstName, lastName, email, user_id);
    return db.query(
        //     `INSERT INTO users_profiles(age,city,homepage,user_id)
        // VALUES ($1, $2, $3,$4)
        // ON CONFLICT (user_id)
        // DO UPDATE SET firstname=$1,lastname=$2,email=$6
        // RETURNING *`,
        `UPDATE users SET firstname=$1,lastname=$2,email=$3 where id=$4
  
   RETURNING *`,
        [firstName, lastName, email, user_id]
    );
}

module.exports = {
    createUser,
    createSignatures,
    getProfile,
    getName,
    getUserByEmail,
    createUserProfile,
    createDataTable,
    deleteUser,
    getSignature,
    CountSigners,
    getSignersByCity,
    updateUserInfo,
    updateUserProfile,
    deleteUser_profile,
    deleteSignature,
};
