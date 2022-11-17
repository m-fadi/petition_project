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
//const helmet = require("helmet");
app.use(express.static(path.join((__dirname, "views"))));
app.use(express.static(path.join((__dirname, "public"))));
const { body, validationResult } = require("express-validator");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
//app.use(helmet());
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
    deleteUser,
    getSignature,
    CountSigners,
    getSignersByCity,
    updateUserInfo,
    updateUserProfile,
    deleteUser_profile,
    deleteSignature,
} = require("./database/db.js");
let signed = false;
let edit = false;
let noSignature = true;

// home route (registering)

app.use((req, res, next) => {
    console.log("---------------------");
    console.log("req.url:", req.url);
    console.log("req.method:", req.method);
    console.log("req.session:", req.session);
    console.log("---------------------");
    next();
});

app.use((req, res, next) => {
    if (!req.session.userId && req.url != "/login" && req.url != "/sign_up") {
        res.redirect("/login");
    } else {
        next();
    }
});
app.get("/login", (req, res) => {
    //const cookie = req.session;

    res.render("login");
});
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // if (!req.cookies.session) res.redirect("login");
    getUserByEmail(email)
        .then((user) => {
            //console.log("user after log in", user);
            if (!user) {
                let wrongData = true;
                return res.render("login", { wrongData });
            }

            req.session.firstName = user.firstname;
            req.session.lastName = user.lastname;
            req.session.userId = user.id;
            req.session.email = user.email;
            req.session.created_at = user.created_at;
            //console.log("session after log in", req.session);
            getProfile(user.id).then((user) => {
                //console.log("Profile in login",user)
                req.session.age = user.age;
                req.session.city = user.city;
                req.session.homepage = user.homepage;
            });
            getSignature(user.id).then((result) => {
                if (!result) {
                    return;
                }
                noSignature = false;
                return noSignature;
            });
            console.log("NoSignature", noSignature);
            bcrypt
                .compare(password, user.password)
                .then(function (passMatch) {
                    // req.session.userId=result
                    if (passMatch) {
                        return res.redirect("/thanks_for_signing");
                    } else {
                        let wrongData = true;
                        return res.render("login", { wrongData });
                    }
                })
                .catch((error) => console.log(error));
        })
        .catch((error) => {
            res.sendStatus(401);
        });
});

app.get("/", (req, res) => {
    //const cookie = req.session.userId;

    //if (cookie) res.redirect("/login");
    res.redirect("sign_up");
});
app.get("/sign_up", (req, res) => {
    //const cookie = req.cookies;
    if (req.session.userId) res.redirect("/edit");
    //if (cookie.session) res.redirect("/login");
    res.render("sign_up");
});

app.post(
    "/sign_up",
    body("email").isEmail().escape().normalizeEmail(),
    body("password").isLength({ min: 3 }),
    body("firstName").not().isEmpty().trim().escape(),
    body("lastName").not().isEmpty().trim().escape(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("here");
            let dataNotValid = true;
            return res.render("sign_up", { dataNotValid });
        }
        let { firstName, lastName, email, password, signature } = req.body;
        console.log("email from user", email);
        const created_at = new Date();
        getUserByEmail(email).then((user) => {
            //console.log("user after log in", user);
            if (user) {
                let emailIsUsed = true;
                return res.render("sign_up", { emailIsUsed });
            }
            console.log("user data ", user);
            hash(password).then((password) => {
                createUser({
                    firstName,
                    lastName,
                    email,
                    password,
                    created_at,
                })
                    .then((user) => {
                        console.log("data from database: ", user);
                        req.session.firstName = user.firstname;
                        req.session.lastName = user.lastname;
                        req.session.userId = user.id;
                        req.session.email = user.email;
                        req.session.created_at = user.created_at;
                        console.log(user.id);
                        //getUserInfo(user.id);///////////////////////////////
                        res.redirect("/user_profile");
                    })
                    .catch((error) => console.log(error));
            });
        });
    }
);

app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});
//route to users profile data
app.get("/user_profile", (req, res) => {
    res.render("user_profile", { edit });
});
app.post("/user_profile", (req, res) => {
    user_id = req.session.userId;
    const { age, city, homepage } = req.body;

    if (isNaN(age)) {
        {
            dataNotValid;
        }
        res.render("user_profile", { dataNotValid });
        return;
    }

    // delete data if exist and inject new data// !!!!!!!!better way to do it is to update instead of delete!!!!!!
    cityUpper = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    console.log(city);
    createUserProfile({ age, cityUpper, homepage, user_id }).then((result) => {
        req.session.age = result.age;
        req.session.city = result.city;
        req.session.homepage = result.homepage;
        res.redirect("/sign_petition");
    });

    // });
});

//signing petition route after regestering
app.get("/sign_petition", (req, res) => {
    console.log(req.session);
    //if (!req.cookies.session) res.redirect("login");
    getSignature(req.session.userId).then((result) => {
        console.log("result get signature", result);
        if (!result) {
            res.render("sign_petition");
            return;
        }
        res.redirect("/thanks_for_signing");
    });
});

app.post("/sign_petition", (req, res) => {
    userId = req.session.userId;

    let { signature } = req.body;

    createSignatures({ userId, signature })
        .then((result) => {
            noSignature = false;
            // req.session.signature = result.signature;
            req.session.countSignatures = result.count;
            res.redirect("/thanks_for_signing");
        })
        .catch((error) => console.log(error));
    // !!!!!!!!problem redirect should be inside the (then) line 124 but it dont work, and like this the signature doesnt get passed to the next route
});

// the Thanks route(after signing the petition)
app.get("/thanks_for_signing", (req, res) => {
    console.log(noSignature);
    // if (!req.cookies.session) res.redirect("login");

    const { firstName, lastName, userId } = req.session;
    CountSigners().then((result) => {
        req.session.countSignatures = result.count;
        console.group("sig count", result.count);
        let msg;
        let signature;

        getSignature(userId)
            .then((result) => {
                if (!result) {
                    return res.render("thanks_for_signing", { noSignature });
                }
                signature = result.rows[0].signature;
                const { countSignatures } = req.session;
                console.log("result.rows", countSignatures);
                msg = `  ${
                    countSignatures == 1
                        ? "vote, you are the first to vote"
                        : "  people has already signed"
                } `;
                res.render("thanks_for_signing", {
                    first:
                        firstName.charAt(0).toUpperCase() + firstName.slice(1),
                    last: lastName.charAt(0).toUpperCase() + lastName.slice(1),
                    countSignatures: countSignatures,
                    thanksMsg: msg,
                    signature: signature,
                    noSignature: noSignature, ////
                });
            })
            .catch((error) => console.log(error));
    });
});

app.get("/signers", (req, res) => {
    // if (!req.cookies.session) res.redirect("login");
    createDataTable().then((signers) => {
        //console.log("signers",signers)
        res.render("signers", { signers });
    });
});

app.get("/location/:city", (req, res) => {
    const city = req.params.city;
    getSignersByCity(city).then((signersProfile) => {
        console.log("SignersByCity", signersProfile);
        res.render("signersByCity", { signersProfile });
    });
});

// app.get("/webpage/:homepage", (req, res) => {
//     const homepage = req.params.homepage.slice(":");
// console.log(homepage)
//    res.redirect("https:" + homepage);
// });
app.get("/edit", (req, res) => {
    const { firstName, lastName, age, city, homepage, email } = req.session;
    console.log(email, homepage);

    res.render("edit_profile", {
        firstName,
        lastName,
        age,
        city,
        homepage,
        email,
    });
    /////////ghere maybe better to call the data back from the db!!!!!!!
});

app.post("/edit", (req, res) => {
    let user_id = req.session.userId;

    const { firstName, lastName, email, city, homepage, age } = req.body;
    if (firstName == "" || lastName == "" || email == "") {
        let dataNotValid = true;
        res.render("edit_profile", { dataNotValid });
    }
    let cityUpper = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    Promise.all([
        updateUserProfile({ cityUpper, homepage, age, user_id }),
        updateUserInfo({ firstName, lastName, email, user_id }),
    ])
        .then((result) => {
            let user = result[1].rows[0];
            let user_profile = result[0].rows[0];
            req.session.firstName = user.firstname;
            req.session.lastName = user.lastname;
            req.session.userId = user.id;
            req.session.email = user.email;
            req.session.created_at = user.created_at;
            req.session.age = user_profile.age;
            req.session.city = user_profile.city;
            req.session.homepage = user_profile.homepage;
            // console.log(
            //     "user_profile",
            //     result[0].rows[0],
            //     "user",
            //     result[1].rows[0]
            // );

            res.redirect("/thanks_for_signing");
        })
        .catch((error) => console.log(error));

    // getUserInfo(
    //     { firstName, lastName, email, city, homepage, age, user_id }).then((result) => console.log(result));
});

app.post("/deleteProfile", (req, res) => {
    let user_id = req.session.userId;
    Promise.all([
        deleteUser_profile(user_id),
        deleteUser(user_id),
        deleteSignature(user_id),
    ])
        .then(() => {
            req.session = null;
            return res.redirect("login");
        })
        .catch((error) => console.log(error));
});

app.post("/deleteSignature", (req, res) => {
    let user_id = req.session.userId;
    deleteSignature(user_id).then(() => {
        noSignature = true;
        // res.redirect("/sign_petition");
        res.redirect("/thanks_for_signing");
    });
});

// login route

app.listen(PORT, () => {
    console.log(`I'm listening on port ${PORT}`);
});
