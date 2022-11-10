require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const { engine, handlebars } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.urlencoded());
app.use(express.static(path.join((__dirname, "views"))));
app.use(express.static(path.join((__dirname, "public"))));
const { createProfile, getProfiles, getName } = require("./database/db.js");
const cookieParser = require("cookie-parser");
const { addAbortSignal } = require("stream");
app.use(cookieParser());
const { PORT } = process.env;
//console.log(createProfile('fadi', 'marouf'));

// const countUsers=(req,res,next)=>{
//     counter++;
//     console.log(counter)

//     next()
// }
//app.use(countUsers);
let counter = 0;
app.use(
    require("cookie-session")({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.get("/", (req, res) => {
    const cookie = req.cookies
    
    if(cookie.session) res.redirect("/thanks");
    res.render("petition");
});

app.post("/", (req, res) => {
    ///if (req.cookies.value)
    //    { //console.log(req.cookies);
    //     return
    //     }

    let { firstName, lastName, signature } = req.body;
console.log(signature)
    if(!firstName&& !lastName&& !signature){
        res.redirect("/")
        return
    }
    
    console.log(signature);
    createProfile({ firstName, lastName, signature }).then((user) => {
        req.session.firstName = user.firstname;
        req.session.lastName = user.lastname;
        req.session.userId = user.id;
        console.log("first", req.session);

        res.redirect("/thanks");
    });
});
app.get("/thanks", (req, res) => {
    const { firstName, lastName, userId } = req.session;
    let msg = `${userId === 1 ? "person" : "people"} has already signed`;
    res.render("thanksForSigning", {
        first: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        last: lastName.charAt(0).toUpperCase() + lastName.slice(1),
        countUsers: userId,
        thanksMsg: msg,
    });
});

app.get("/signed", (req, res) => {
    getProfiles().then((signers) => {
        res.render("signedPeople", { signers });
    });
});

app.listen(PORT, () => {
    console.log(`I'm listening on port ${PORT}`);
});
