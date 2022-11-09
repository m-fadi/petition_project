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
const {createProfile,getProfiles,getName}= require("./database/db.js")

//console.log(createProfile('fadi', 'marouf'));



app.get("/", (req, res) => {
    
    res.render("petition");
});

app.post("/", (req, res) => {
    console.log(req.body);
    //res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`I'm listening on port ${PORT}`);
});

// require("dotenv").config();
// const path = require("path");
// const express = require("express");
// const fs = require("fs");

// const app = express();
// app.get("/", (req,res)=>{
//     res.sendFile(path.join(__dirname, "/"));
// })
// app.get("/ss", (req, res) => {
//     res.sendFile(path.join(__dirname, "/"));
// });
// app.listen(3000, () => {
//     console.log(" app running..");
// });
