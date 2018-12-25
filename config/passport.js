const bcrypt = require('bcrypt');

const {dbColumns} = require('../DB/dbconfs');
const userDriver = require('../DB/userDriver');
const LocalStrategy = require('passport-local').Strategy;

const {passportError} = require("../errors/codes");

const regex = require("../config/regex");

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
		userDriver.user.getById(id,done);
	});

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

	passport.use('local-signup', new LocalStrategy({usernameField: 'email',passwordField: 'password'},(email, password, done) => {
		// register user
		// see if user and password are valid
		if(email == "" && regex.password.test(password))
			return done(passportError.userOrPasswordInvalid);

		// see if user exists
		userDriver.user.getByEmail(email,(err, user)=>{
			if(err){
				return done({...passportError.unexptedError,...(leakInternalErrors?{internalError:err}:{})});
			}
			
			if(user)
				return done(passportError.userAlreadyExists);
			
			// calculate password hash
			bcrypt.hash(password, 11, (err, hpass)=>{
				if(err)
					return done({...passportError.unexptedError,...(leakInternalErrors?{internalError:err}:{})});

				// create user
				userDriver.user.newUser(email, hpass, function(err){
					if(err)
						return done({...passportError.unexptedError,...(leakInternalErrors?{internalError:err}:{})});
					
					// sqlite should return the inserted column
					// it cant because it's insert command is run on the run method
					// what a shame..
					return userDriver.user.getByEmail(email,done);
				});
			});
		});
	}));


	// =========================================================================
	// LOCAL LOGIN ============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'
	passport.use('local-login', new LocalStrategy({usernameField: 'email',passwordField: 'password'},(email, password, done) => {
		userDriver.user.getByEmail(email,(err, user)=>{
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
