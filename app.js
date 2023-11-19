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

//regiser new user
// api 1
app.post("/register/",async(request,response)=>{
    const {username,password,name,gender}=request.body;
    const checkUser=`SELECT username from user WHERE username='${username}'`;
    const dbUser = await db.get(checkUser);
    if(dbUser!==undefined){
        response.status(400);
        response.send("User already exists");
    }
    else{
        if(password.length<6){
            response.status(400);
            response.send("Password is too short");

        }
        else{
            const hashedPassword = await bcrypt.hash(password,10);
            const createUserQuery = `INSERT INTO user(name,username,password,gender) values(
                '${name}','${username}','${password}','${name}','${gender}')`;
            await db.run(createUserQuery);
            response.status(200);
            response.send("User created successfully");
        }
    }
});
