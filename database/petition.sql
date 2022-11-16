


DROP TABLE IF EXISTS users_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS signatures;


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL CHECK(firstname!=''),
    lastname VARCHAR(255) NOT NULL CHECK(lastname!=''),
    email VARCHAR(255) NOT NULL UNIQUE CHECK(email!=''),
    password VARCHAR(255) NOT NULL CHECK(password!=''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY ,
    -- first_name VARCHAR(255) NOT NULL,
    -- last_name VARCHAR(255) NOT NULL,
    signature text NOT NULL,
    userId INT NOT NULL 
);



CREATE TABLE users_profiles(
    id SERIAL PRIMARY KEY,
    age int ,
    city VARCHAR(255) ,
    homepage VARCHAR(255) ,
    user_id INT NULL UNIQUE  REFERENCES users(id)
);

--  psql -d petition -f database/petition.sql;
-- sudo su postgres;
-- TRUNCATE users_profiles, users,signatures RESTART IDENTITY;
-- delete  from users;
-- validater.validate(email validation)
-- sudo service postgresql start;

-- how to check if if the current id in create signatures nd in users_profiles exist ????



-- Multiple Queries
-- var connection = mysql.createConnection({multipleStatements: true});

-- connection.query('SELECT ?; SELECT ?', [1, 2], function(err, results) {
--   if (err) throw err;


--   // `results` is an array with one element for every statement in the query:
--   console.log(results[0]); // [{1: 1}]
--   console.log(results[1]); // [{2: 2}]
-- });


-- Promise.all([client.query(...), client.query(..)]) 
-- and .then(([result1, result2]) => {}



-- delete sig-imagedelete cookie after delte profile // noSignature 233 notb rendering!!!!
-- login with regester !!!!
-- cookioe not added by login????