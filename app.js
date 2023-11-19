const express = require("express");
const app = express();
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname,"twitterClone.db");
let db = null;
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const initializeDbAndServer = async()=>{
    try{
        db = await open({
            filename:dbPath,
            driver:sqlite3.Database
        });
        app.listen(3000,()=>{
            console.log("Server running at http://localhost:3000/");
        });
    }catch(e){
        console.log(`DB Error:${e.message}`);
        process.exit(1);
    }
}
initializeDbAndServer();

