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

//api 2

app.post("/login/",async(request,response)=>{
	const {username,password}=request.body;
	const checkUser=`select * from user where username='${username}';`;
	const dbUser=await database.get(checkUser);
	if(dbUser===undefined){
		response.status(400);
		response.send("Invalid user");
	}
	else{
		const isPasswordMatched=await bcrypt.compare(password,dbUser.password);
		if(isPasswordMatched===true){
			const payload={
				username:username
			};
			const jwtToken=jwt.sign(payload,"MY_SECRET_TOKEN");
			response.send({jwtToken});
		}
		else{
			response.status(400);
			response.send("Invalid password");
		}
	}
	
}
);



//authentication middleware

const authenticationToken =(request,response,next)=>{
	let jwtToken;
	const authHeader=request.headers["authorization"];
	if(authHeader!==undefined){
		jwtToken=authHeader.split(" ")[1];
	}
	else{
		response.status(401);
		response.send("Invalid JWT Token");
	}

	if(jwtToken!=undefined){
		jwt.verify(jwtToken,"MY_SECRET_TOKEN",async(error,payload)=>{
			if(error){
				response.status(401);
				response.send("Invalid JWT Token");
			}
			else{
				request.username=payload.username;
				next();
			}
		});

	}
}

//api 3

app.get("/user/tweets/feed/", authenticationToken, async (request, response) => {
	let { username } = request;
	const getUserIdQuery = `select user_id from user where username='${username}';`;
	const getUserId = await database.get(getUserIdQuery);
	// console.log(getUserId);
	const getFollowerIdsQuery = `select following_user_id from follower 
    where follower_user_id=${getUserId.user_id};`;
	const getFollowerIdsArray = await database.all(getFollowerIdsQuery);
	// console.log(getFollowerIdsArray);
	const getFollowerIds = getFollowerIdsArray.map((eachUser) => {
		return eachUser.following_user_id;
	});
	// console.log(`${getFollowerIds}`);
	const getFollowersResultQuery = `select name from user where user_id in (${getFollowerIds});`;
	const responseResult = await database.all(getFollowersResultQuery);
	//console.log(responseResult);
	response.send(responseResult);
});

//api 4 

app.get("/user/following/", authenticationToken, async (request, response) => {
	let { username } = request;
	const getUserIdQuery = `select user_id from user where username='${username}';`;
	const getUserId = await database.get(getUserIdQuery);
	// console.log(getUserId);
	const getFollowerIdsQuery = `select following_user_id from follower 
	where follower_user_id=${getUserId.user_id};`;
	const getFollowerIdsArray = await database.all(getFollowerIdsQuery);
	// console.log(getFollowerIdsArray);
	const getFollowerIds = getFollowerIdsArray.map((eachUser) => {
		return eachUser.following_user_id;
	});
	// console.log(`${getFollowerIds}`);
	const getFollowersResultQuery = `select name from user where user_id in (${getFollowerIds});`;
	const responseResult = await database.all(getFollowersResultQuery);
	//console.log(responseResult);
	response.send(responseResult);
});
