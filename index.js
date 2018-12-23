
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
require('./config/passport')(passport);

const app = express();
const PORT = 4020;

// import middlewares
const {auth_isLogged, auth_isNotLogged} = require("./middlewares/auth/session");


// import routes
const dbRouter = require("./routes/dbRouter");

const {leakInternalErrors} = require("./config/globals");
const {passportError} = require("./errors/codes");
const {dbColumns} = require('./DB/dbconfs');

// Express initializations
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
	store: new SQLiteStore, // eslint-disable-line new-parens
	secret: 'your secret',
	cookie: {maxAge: 7 * 24 * 60 * 60 * 1000}, // 1 week
	resave: false,
	saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/db", dbRouter);


// login route
app.post('/login', auth_isNotLogged, function(req, res, next) {
	passport.authenticate('local-login', function(err, user) {
		// console.log(err,user);
		if (err)
			return res.send(err);
		if (!user)
			return res.send(passportError.userNotFound);
		
		req.logIn(user, function(err) {
			if(err)
				return res.send({...passportError.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
			return res.send({code:1, message:"User logged.", username:user[dbColumns.latest.Users.USERNAME]});
		});
	})(req, res, next);
});
app.post("/signup", auth_isNotLogged, function(req, res, next) {
	// console.log("calling");
	passport.authenticate('local-signup', function(err, user) {
		// console.log("resis",err,user);
		if (err){
			return res.send(err);}
		if (!user)
			return res.send(passportError.userOrPasswordInvalid);

		req.logIn(user, function(err) {
			console.log("hehre",err);
			if(err)
				return res.send({...passportError.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
			console.log("wiwi")
			console.log(user)
			return res.send({code:1, message:"User logged.", username:user[dbColumns.latest.Users.USERNAME]});
		});
	})(req, res, next);
});

// ping route
app.get("/ping",(req,res)=>{
	return res.status(200).send({message: "All channels working properly."});
});

// Server listening
app.listen(PORT, ()=>{
	console.log(`Listening on ${PORT}`);
});



