


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
    age VARCHAR,
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


-- git push -u petition fadi  