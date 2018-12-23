const {passportError} = require("../../errors/codes")

function auth_isLogged(req, res, next) {
    // if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
		// console.log("is logged");
		return next();
	}


    // if they aren't redirect them to the home page
	// console.log("is not logged", req.url);
    res.send(passportError.userLogged);
}

function auth_isNotLogged(req, res, next) {
    // if user is not authenticated in the session, carry on
	if (!req.isAuthenticated()){
		return next();
	}

    // if they aren't redirect them to the home page
    res.send(passportError.userNotLogged);
}

module.exports = {auth_isLogged, auth_isNotLogged};
