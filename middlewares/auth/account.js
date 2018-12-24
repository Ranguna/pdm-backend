const {passportError} = require("../../errors/codes");
const {dbColumns} = require("../../DB/dbconfs");

function account_isActive(req, res, next) {
	if(req.user[dbColumns.latest.Users.DATADES] == -1)
		return next();

	res.status(400).send(passportError.accountDeactivated);
}

module.exports = {account_isActive};
