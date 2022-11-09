require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const { engine, handlebars } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
const PORT = 3000;
app.use(express.urlencoded());
app.use(express.static(path.join((__dirname, "views"))));
app.use(express.static(path.join((__dirname, "public"))));
const { createProfile, getProfiles, getName } = require("./database/db.js");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
require("dotenv").config();
//console.log(createProfile('fadi', 'marouf'));

app.get("/", (req, res) => {
    res.render("petition");
});

app.post("/", (req, res) => {
   if (req.cookies.value) 
       { console.log(req.cookies);
        return
        }
    
    const { firstName, lastName } = req.body;
    createProfile({ firstName, lastName }).then();
    res.cookie("value", "1");
    res.render("thanksForSigning");
});

app.get("/signed", (req, res) => {
    getProfiles().then((signers) => {
        res.render("signedPeople", { signers });
    });
});

app.listen(PORT, () => {
    console.log(`I'm listening on port ${PORT}`);
});
