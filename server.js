require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const { engine, handlebars } = require("express-handlebars");
var bcrypt = require('bcryptjs');
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
const {hash, compare}=require('./hash')
app.use(express.urlencoded());
app.use(express.static(path.join((__dirname, "views"))));
app.use(express.static(path.join((__dirname, "public"))));

const cookieParser = require("cookie-parser");
const { addAbortSignal } = require("stream");
const cookieSession = require("cookie-session");
app.use(cookieParser());
const { PORT } = process.env;

app.use(
    require("cookie-session")({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
const {
    createUser,
    getProfiles,
    getName,
    createSignatures,
    getUserByEmail,
} = require("./database/db.js");

// home route (registering)
app.get("/", (req, res) => {
    const cookie = req.cookies;

    if (cookie.session) res.redirect("/login");
    res.render("petition");
});

app.post("/", (req, res) => {
    let { firstName, lastName, email, password, signature } = req.body;
    if (!firstName && !lastName && !signature) {
        res.redirect("/");
    } // add partial to tell the user he/she to fill the fields?????
    // check if userId exist skip the register page to the login page
    const created_at = new Date();
    hash(password).then((password=>{

        createUser({ firstName, lastName, email, password, created_at }).then(
            ///// add logic to hash the password?????////////
            (user) => {
                req.session.firstName = user.firstname;
                req.session.lastName = user.lastname;
                req.session.userId = user.id;
                req.session.email = user.email;
                req.session.created_at = user.created_at;
                res.redirect("/sign");
            }
        );
    }))
    
    
});

//signing petition route after regestering
app.get("/sign", (req, res) => {
    res.render("sign");
});
app.post("/sign", (req, res) => {
    userId = req.session.userId;

    let { signature } = req.body;
    console.log("reqBody", req.body.signature);
    createSignatures({ userId, signature }).then(signature);
    res.redirect("/thanks");
});

// the Thanks route(after signing the petition)
app.get("/thanks", (req, res) => {
    const { firstName, lastName, userId, signature } = req.session;

    let msg = `${userId === 1 ? "person" : "people"} has already signed`;
    res.render("thanksForSigning", {
        first: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        last: lastName.charAt(0).toUpperCase() + lastName.slice(1),
        countUsers: userId,
        thanksMsg: msg,
        signature: signature,
    });
});

app.get("/signers", (req, res) => {
    getProfiles().then((signers) => {
        res.render("signers", { signers });
    });
});

// login route
app.get("/login", (req, res) => {
    //let { firstName, lastName, email, password, signature } = req.body;
    res.render("login");
    //const { email, password } = req.body;
});

//
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    getUserByEmail(email)
        .then((user) => {
            
            ////// logic to compare password and email???///////

        })
        .catch((error) => {
            console.log(error);
        });
    // userId = req.session.userId;

    // let { signature } = req.body;
    // console.log("reqBody", req.body.signature);
    // createSignatures({ userId, signature }).then(
    //     signature

    // );
    // res.redirect("/thanks");
});

app.listen(PORT, () => {
    console.log(`I'm listening on port ${PORT}`);
});
