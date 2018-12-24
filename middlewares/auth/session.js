const {passportError} = require("../../errors/codes");

function auth_isLogged(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
		// console.log("is logged");
		return next();
	}
	

	// if they aren't redirect them to the home page
	// console.log("is not logged", req.url);
	res.status(400).send(passportError.userNotLogged);
}

function auth_isNotLogged(req, res, next) {
	// if user is not authenticated in the session, carry on
	if (!req.isAuthenticated()){
		return next();
	}

	// if they aren't redirect them to the home page
	res.status(400).send(passportError.userLogged);
}

module.exports = {auth_isLogged, auth_isNotLogged};
