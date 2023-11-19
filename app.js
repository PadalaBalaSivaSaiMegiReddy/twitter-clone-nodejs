const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//const format = require("date-fns/format");
let database;
const app = express();
app.use(express.json());

const initializeDBandServer = async () => {
	try {
		database = await open({
			filename: path.join(__dirname, "twitterClone.db"),
			driver: sqlite3.Database,
		});
		app.listen(3000, () => {
			console.log("Server is running on http://localhost:3000/");
		});
	} catch (error) {
		console.log(`Database error is ${error.message}`);
		process.exit(1);
	}
};

initializeDBandServer();

//homepage

app.get("/", (request, response) => {
    response.send("Twitter Clone");
}
);


//api 1

app.post("/register/", async (request, response) => {
	const { username, password, name, gender } = request.body;
	const checkUser = `select username from user where username='${username}';`;
	const dbUser = await database.get(checkUser);
	console.log(dbUser);
	if (dbUser !== undefined) {
		response.status(400);
		response.send("User already exists");
	} else {
		if (password.length < 6) {
			response.status(400);
			response.send("Password is too short");
		} else {
			const hashedPassword = await bcrypt.hash(password, 10);
			const requestQuery = `insert into user(name, username, password, gender) values(
          '${name}','${username}','${hashedPassword}','${gender}');`;
			await database.run(requestQuery);
			response.status(200);
			response.send("User created successfully");
		}
	}
});
