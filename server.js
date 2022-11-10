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
const {
    createUser,
    getProfiles,
    getName,
    createSignatures,
} = require("./database/db.js");
const cookieParser = require("cookie-parser");
const { addAbortSignal } = require("stream");
const cookieSession = require("cookie-session");
app.use(cookieParser());
const { PORT } = process.env;
//console.log(createProfile('fadi', 'marouf'));

// const countUsers=(req,res,next)=>{
//     counter++;
//     console.log(counter)

//     next()
// }
//app.use(countUsers);

app.use(
    require("cookie-session")({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.get("/", (req, res) => {
    const cookie = req.cookies;

    if (cookie.session) res.redirect("/thanks");
    res.render("petition");
});

app.post("/", (req, res) => {
    ///if (req.cookies.value)
    //    { //console.log(req.cookies);
    //     return
    //     }

    let { firstName, lastName, email, password, signature } = req.body;

    if (!firstName && !lastName && !signature) {
        res.redirect("/");
    } // add partial to tell the user he/she to fill the fields?????
    // check if userId exist scip the register page to the login page
    const created_at = new Date();
    createUser({ firstName, lastName, email, password, created_at }).then(
        (user) => {
            req.session.firstName = user.firstname;
            req.session.lastName = user.lastname;
            req.session.userId = user.id;
            req.session.email = user.email;
            req.session.created_at = user.created_at;

            res.redirect("/sign");
        }
    );
});

app.get("/sign", (req, res) => {
    //const cookie = req.cookies;

    //if (cookie.session) res.redirect("/thanks");
    res.render("sign");
});
app.post("/sign", (req, res) => {
    userId=req.session.userId

    let {signature}=req.body
    console.log("reqBody",req.body.signature);
    createSignatures({ userId, signature }).then(
        signature

        //console.log("signatureData", signature)
    );
    res.redirect("/thanks");
});

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

app.listen(PORT, () => {
    console.log(`I'm listening on port ${PORT}`);
});
