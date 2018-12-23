const bcrypt = require('bcrypt');

const {db, dbDriver, dbColumns} = require('../DB/dbconfs');
const LocalStrategy = require('passport-local').Strategy;

const {passportError} = require("../errors/codes");

const regex = {
	user: /[\p{L} ]+/gu,
	password: /^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*\d+)(?=.*[^a-zA-Z0-9\u0000-\u001F\u0080-\u00A0]+)[^\u0000-\u001F\u0080-\u00A0]{8,100}$/gu
};

const {leakInternalErrors} = require("../config/globals");

module.exports = function(passport) {

	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user[dbColumns.latest.Users.ID]);
	});
	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		dbDriver.user.getById(id,done);
	});

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

	passport.use('local-signup', new LocalStrategy((username, password, done) => {
		// register user
		// see if user and password are valid
		if(!(regex.user.test(username) && regex.password.test(password)))
			return done(passportError.userOrPasswordInvalid);

		// see if user exists
		dbDriver.user.getByUsername(username,(err, user)=>{
			if(err){
				return done({...passportError.unexptedError,...(leakInternalErrors?{internalError:err}:{})});
			}
			
			if(user)
				done(passportError.userAlreadyExists);
			
			// calculate password hash
			bcrypt.hash(password, 11, (err, hpass)=>{
				if(err)
					return done({...passportError.unexptedError,...(leakInternalErrors?{internalError:err}:{})});

				// create user
				dbDriver.user.newUser(username, hpass, function(err){
						if(err)
							return done({...passportError.unexptedError,...(leakInternalErrors?{internalError:err}:{})});
						
						// sqlite should return the inserted column
						// it cant because it's insert command is run on the run method
						// what a shame..
						return dbDriver.user.getByUsername(username,done);
					}
				);
			});
		});
	}));


	// =========================================================================
	// LOCAL LOGIN ============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'
	passport.use('local-login', new LocalStrategy((username, password, done) => {
		dbDriver.user.getByUsername(username,(err, user)=>{
			if(err)
				return done(err);

			if(!user)
				return done(passportError.userOrPasswordInvalid);

			bcrypt.compare(password, user[dbColumns.latest.Users.PASS], (err, ok)=>{
				if(err)
					return done({...passportError.unexptedError, ...(leakInternalErrors?{internalError: err}:{})});
				
				if(!ok)
					return done(passportError.userOrPasswordInvalid);
				
				done(null, user);
			});
		});
	}));
};
