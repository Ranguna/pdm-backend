// accountRouter.js
const express = require('express');
const accountRouter = express.Router();

const {auth_isLogged} = require("../middlewares/auth/session");
const {account_isActive} = require("../middlewares/auth/account");

const {accountErrors, dbError} = require("../errors/codes");
const {leakInternalErrors} = require("../config/globals");

const {dbDriver, dbColumns} = require('../DB/dbconfs');
const regex = require("../config/regex");

accountRouter.patch("/changeData", auth_isLogged, account_isActive, (req,res)=>{
	if(!req.body)
		return res.status(400).send(accountErrors.invalidRequestBody);
	
	if(req.body.nome && !regex.user.test(req.body.nome))
		return res.status(400).send(accountErrors.invalidNomeFormatting);


	dbDriver.user.changeFields(
		req.user[dbColumns.latest.Users.USERNAME],
		req.body.nome || req.user[dbColumns.latest.Users.NOME],
		req.body.nascimento || req.user[dbColumns.latest.Users.DATANASC],
		req.body.carta || req.user[dbColumns.latest.Users.DATACARTA],
		(err, rowsChanged)=>{
			if(err)
				return res.status(500).send({...accountErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
			
			return res.send({code: 1, message: "OK", rowsChanged});
		}
	);
});

accountRouter.get("/getData", (req,res)=>{
	if(!req.query.username)
		return res.status(400).send(accountErrors.noUsernameProvided);
	
	dbDriver.user.getByUsername(req.query.username, (err, user)=>{
		if(err)
			return res.status(500).send({...accountErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
		
		return res.send({
			[dbColumns.latest.Users.NOME]: user[dbColumns.latest.Users.NOME],
			[dbColumns.latest.Users.DATACARTA]: user[dbColumns.latest.Users.DATACARTA],
			[dbColumns.latest.Users.DATACARTA]: user[dbColumns.latest.Users.DATACARTA],
			[dbColumns.latest.Users.DATANASC]: user[dbColumns.latest.Users.DATANASC],
			[dbColumns.latest.Users.DATANASC]: user[dbColumns.latest.Users.DATANASC],
			[dbColumns.latest.Users.DATACRI]: user[dbColumns.latest.Users.DATACRI],
			[dbColumns.latest.Users.DATACRI]: user[dbColumns.latest.Users.DATACRI],
			[dbColumns.latest.Users.FOTO]: user[dbColumns.latest.Users.FOTO],
		});
	});
	
});

accountRouter.patch("/changePassword", auth_isLogged, account_isActive, (req,res)=>{
	if(!req.body)
		return res.status(400).send(accountErrors.invalidRequestBody);

	if(!regex.password.test(req.body.newPassword))
		return res.status(400).send(accountErrors.invalidPasswordFormatting);
	
	dbDriver.user.changePassword(req.user[dbColumns.latest.Users.USERNAME], req.body.oldPassword, req.body.newPassword, (err,changed)=>{
		if(err){
			if(err === dbError.invalidPassword)
				return res.status(400).send(err);
			return res.status(500).send({...accountErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
		}

		return res.send({code: 1, message: "OK", changed: changed != 0});
	});
});

module.exports = accountRouter;
