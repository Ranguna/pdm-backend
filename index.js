
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

// import setting and functions
const {leakInternalErrors} = require("./config/globals");
const {passportError} = require("./errors/codes");
const {dbColumns} = require('./DB/dbconfs');
const userDriver = require("./DB/userDriver");

// import routes
const dbRouter = require("./routes/dbRouter");
const accountRouter = require("./routes/accountsRouter");
const boleiaRouter = require("./routes/boleiaRouter");

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
app.use("/account", accountRouter);
app.use("/boleia", boleiaRouter);


// login route
app.post('/login', auth_isNotLogged, function(req, res, next) {
	passport.authenticate('local-login', function(err, user) {
		// console.log(err,user);
		if (err)
			return res.send(err);
		if (!user)
			return res.send(passportError.userNotFound);
		
		userDriver.user.isActiveEmail(user[dbColumns.latest.Users.EMAIL],(err, active)=>{
			if(err)
				return res.status(500).send({...passportError.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
			
			if(!active)
				return res.status(400).send(passportError.accountDeactivated);

			req.logIn(user, function(err) {
				if(err)
					return res.send({...passportError.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});

				return res.send({code:1, message:"User logged.", email:user[dbColumns.latest.Users.EMAIL]});
			});
		});
	})(req, res, next);
});
app.post("/signup", auth_isNotLogged, function(req, res, next) {
	// console.log("calling");
	passport.authenticate('local-signup', function(err, user) {
		// console.log("resis",err,user);
		if (err){
			if(err == passportError.userAlreadyExists)
				return res.status(400).send(err);
			return res.status(500).send(err);
		}
		if (!user)
			return res.send(passportError.userOrPasswordInvalid);

		req.logIn(user, function(err) {
			if(err)
				return res.send({...passportError.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
			
			return res.send({code:1, message:"User logged.", email: user[dbColumns.latest.Users.EMAIL]});
		});
	})(req, res, next);
});
app.post("/logout", auth_isLogged, (req, res)=>{
	req.logout();
	res.send({code:1, message:"User logged out"});
});
app.get("/checkSession", auth_isLogged, (req,res)=>{
	res.send({code:1, message:"User logged", email: req.user[dbColumns.latest.Users.EMAIL]});
});
app.delete("/deactivateSelfAccount", auth_isLogged, (req, res)=>{
	let email = req.user[dbColumns.latest.Users.EMAIL];
	userDriver.user.removeByEmail(email,(err, changes)=>{
		if(err)
			return res.status(500).send({...passportError.unexptedError,...(leakInternalErrors?{internalError:err}:{})});
		
		if(changes == 0)
			return res.send({code: 2, message: "User was not deactivated."});
			
		req.logOut();
		return res.send({code: 1, message: "User has been loggout out and deactivated."});
	});
});
app.post("/activateAccount", (req, res)=>{
	if(!req.body.email || !req.body.password)
		return res.send(passportError.userOrPasswordInvalid);

	// see if user exists
	userDriver.user.getByEmail(req.body.email, (err, user)=>{
		if(err)
			return res.status(500).send({...passportError.unexptedError,...(leakInternalErrors?{internalError:err}:{})});
		
		if(!user)
			return res.status(400).send(passportError.userOrPasswordInvalid);
		
		userDriver.user.activateByEmail(req.body.email, req.body.password, (err, changes)=>{
			if(err)
				return res.status(500).send({...passportError.unexptedError,...(leakInternalErrors?{internalError:err}:{})});
			
			if(changes == 0)
				return res.send({code: 2, message: "User was not reactivated."});
				
			return res.send({code: 1, message: "User has been reactivated."});
		});
	});

	
});

// ping route
app.get("/ping",(req,res)=>{
	return res.status(200).send({message: "All channels working properly."});
});

// Server listening
app.listen(PORT, ()=>{
	console.log(`Listening on ${PORT}`); // eslint-disable-line no-console
});



