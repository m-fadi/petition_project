require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const { engine, handlebars } = require("express-handlebars");
var bcrypt = require("bcryptjs");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
const { hash, compare } = require("./hash");
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
    getProfile,
    getName,
    createSignatures,
    getUserByEmail,
    createUserProfile,
    createDataTable,
    updateUser,
    getSignature,
} = require("./database/db.js");
 let signed=false;
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
    hash(password).then((password) => {
        createUser({ firstName, lastName, email, password, created_at }).then(
            (user) => {
                req.session.firstName = user.firstname;
                req.session.lastName = user.lastname;
                req.session.userId = user.id;
                req.session.email = user.email;
                req.session.created_at = user.created_at;

                //console.log(signature)

                res.redirect("/user_profile");
            }
        );
    });
});

//route to users profile data
app.get("/user_profile", (req, res) => {
    res.render("user_profile");
});
app.post("/user_profile", (req, res) => {
    user_id = req.session.userId;
    const { age, city, homepage } = req.body;
    //clear.log(req.body, user_id)

    if (isNaN(age)) {
        let dataNotValid = true;
        res.render("user_profile", { dataNotValid });
        return;
    }
    updateUser(user_id).then(() => {
        // delete data if exist and inject new data
        createUserProfile({ age, city, homepage, user_id }).then((result) => {
            //getProfile(user_id).then((user) => {

            //console.log(user_id);
            req.session.age = result.age;
            req.session.city = result.city;
            req.session.user_id = result.user_id;
            res.redirect("/sign_petition");
        });

        // });
    });
});

//signing petition route after regestering
app.get("/sign_petition", (req, res) => {
    // !!!!!!!!here condition to check if user already signed !!! getsignature function instede of getProfile
    // getProfile(req.session.user_id).then(user=>{
    console.log(req.session);
    if (!req.cookies.session) res.redirect("login");
    getSignature(req.session.userId).then((result) => {
        //console.log("result of getSig", result);
        
        if(!result)  {
            res.render("sign_petition")
            return
    }
        res.redirect("/thanks_for_signing");
        


    });
    //     if(user_id) {

    //         console.log("get pro",user.id);
    //         console.log(user);

    //         
    //     }
    // })

    
    ;
});

app.post("/sign_petition", (req, res) => {
    userId = req.session.userId;

    let { signature } = req.body;
    //console.log("reqBody", req.body.signature);
    createSignatures({ userId, signature }).then((result) => {
        req.session.signature = result.signature;
        //console.log("session in create sig", req.session);
    });
    res.redirect("/thanks_for_signing"); // !!!!!!!!problem redirect should be inside the (then) line 124 but it dont work, and like this the signature doesnt get passed to the next route
});

// the Thanks route(after signing the petition)
app.get("/thanks_for_signing", (req, res) => {
    if (!req.cookies.session) res.redirect("login");

    const { firstName, lastName, userId, signature } = req.session;

    //console.log("session in thanksFor",req.session);
    let msg = `${userId === 1 ? "person" : "people"} has already signed`;
    res.render("thanks_for_signing", {
        first: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        last: lastName.charAt(0).toUpperCase() + lastName.slice(1),
        countUsers: userId,
        thanksMsg: msg,
        signature: signature,
    });
});

app.get("/signers", (req, res) => {
    if (!req.cookies.session) res.redirect("login");
    //const {firstName, lastName, userId, city,age} = req.session
    createDataTable().then((signers) => {
        //console.log(signers)
        res.render("signers", { signers });
    });
    // getProfiles().then((signers) => {
    //     res.render("signers", { signers });
    // });
});

// login route
app.get("/login", (req, res) => {
    //let { firstName, lastName, email, password, signature } = req.body;
    res.render("login");
    //const { email, password } = req.body;
});
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!req.cookies.session) res.redirect("login");
    getUserByEmail(email)
        .then((user) => {
            //console.log(user)
            if (!user) {
                let wrongData = true;
                return res.render("login", { wrongData });
            }
            bcrypt.compare(password, user.password).then(function (result) {
                if (result) res.render("thanks_for_signing");
                else res.redirect("/login");
            });
            ////// logic to compare password and email???///////
        })
        .catch((error) => {
            res.sendStatus(401);
        });
});

app.listen(PORT, () => {
    console.log(`I'm listening on port ${PORT}`);
});
