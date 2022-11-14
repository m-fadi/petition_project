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
    CountSigners,
    getSignersByCity,
     //getUserInfo,
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
    // if (firstName =="" || lastName=="" || signature=="") {
    //     res.redirect("/");
    // } // add partial to tell the user he/she to fill the fields?????
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
                console.log(user.id)
                //getUserInfo(user.id);///////////////////////////////
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

    if (isNaN(age)) {
        let dataNotValid = true;
        res.render("user_profile", { dataNotValid });
        return;
    }
    updateUser(user_id).then(() => {
        // delete data if exist and inject new data// !!!!!!!!better way to do it is to update instead of delete!!!!!!
        createUserProfile({ age, city, homepage, user_id }).then((result) => {

            req.session.age = result.age;
            req.session.city = result.city;
            req.session.homepage = result.homepage;
            res.redirect("/sign_petition");
        });

        // });
    });
});

//signing petition route after regestering
app.get("/sign_petition", (req, res) => {
    console.log(req.session);
    if (!req.cookies.session) res.redirect("login");
    getSignature(req.session.userId).then((result) => {
        
        if(!result)  {
            res.render("sign_petition")
            return
    }
        res.redirect("/thanks_for_signing");

    });
    ;
});

app.post("/sign_petition", (req, res) => {
    userId = req.session.userId;

    let { signature } = req.body;
    createSignatures({ userId, signature }).then((result) => {
        req.session.signature = result.signature;
    });
    res.redirect("/thanks_for_signing"); // !!!!!!!!problem redirect should be inside the (then) line 124 but it dont work, and like this the signature doesnt get passed to the next route
});

// the Thanks route(after signing the petition)
app.get("/thanks_for_signing", (req, res) => {
    if (!req.cookies.session) res.redirect("login");
    //console.log("IDDDDDDD",req.session)
    //getUserInfo(req.session.userId).then();////////////////////////////////////////
    const { firstName, lastName, userId } = req.session;
    CountSigners().then(result=> req.session.countSignatures=result.count)
    let msg
    let signature;
   
     getSignature(userId).then((result) => {  
        if(!result)  
            return
        signature= result.rows[0].signature
        const {countSignatures}=req.session
        console.log("result.rows", countSignatures);
         msg = `  ${(countSignatures == 1
             ? "vote, you are the first to vote"
             : "  people has already signed")} `;
         res.render("thanks_for_signing", {
             first: firstName.charAt(0).toUpperCase() + firstName.slice(1),
             last: lastName.charAt(0).toUpperCase() + lastName.slice(1),
             countSignatures: countSignatures,
             thanksMsg: msg,
             signature: signature,
         });
    })

});

app.get("/signers", (req, res) => {
    if (!req.cookies.session) res.redirect("login");
    createDataTable().then((signers) => {
        //console.log("signers",signers)
        res.render("signers", { signers });
    });
   
});

app.get("/location/:city", (req, res) => {
    
    const city= req.params.city 
    getSignersByCity(city).then(signersProfile=>{
        console.log("SignersByCity",signersProfile)
        res.render("signersByCity", { signersProfile});
    })
});

// login route
app.get("/login", (req, res) => {
    
    res.render("login");
   
});
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!req.cookies.session) res.redirect("login");
    getUserByEmail(email)
        .then((user) => {
            
            if (!user) {
                let wrongData = true;
                return res.render("login", { wrongData });
            }
            bcrypt.compare(password, user.password).then(function (result) {
                if (result) res.render("thanks_for_signing");
                else res.redirect("/login");
            });
           
        })
        .catch((error) => {
            res.sendStatus(401);
        });
});

app.listen(PORT, () => {
    console.log(`I'm listening on port ${PORT}`);
});
