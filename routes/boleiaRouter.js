// boleiaRouter.js
const express = require('express');
const boleiaRouter = express.Router();

const {auth_isLogged} = require("../middlewares/auth/session");
const {account_isActive} = require("../middlewares/auth/account");

const {boleiaErrors,passportError, dbError} = require("../errors/codes");
const {leakInternalErrors} = require("../config/globals");

const {dbColumns} = require('../DB/dbconfs');
const boleiasDriver = require('../DB/boleiasDriver');

boleiaRouter.post("/new", auth_isLogged, account_isActive, (req,res)=>{
	if(!req.body)
		return res.status(400).send(boleiaErrors.invalidRequestBody);
	
	boleiasDriver.boleia.newBoleia(
		req.user[dbColumns.latest.Users.ID],
		req.body.dataHora,
		req.body.maxPessoas,
		req.body.origem,
		req.body.destino,
		req.body.descricao,
		(err,boleia)=>{
			if(err){
				if(err == passportError.accountDeactivated || err == dbError.invalidData)
					return res.status(400).send(err);
				return res.status(500).send({...boleiaErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
			}

			return res.status(201).send({code:1,message:"Boleia created", ...boleia});
		}
	);
});

boleiaRouter.get("/get/:boleiaId", (req,res)=>{
	if(!req.params.boleiaId)
		return req.status(400).send(boleiaErrors.invalidBoleiaId);

	boleiasDriver.boleia.getBoleiaById(req.params.boleiaId, (err, boleia)=>{
		if(err)
			return res.status(500).send({...boleiaErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
		
		return res.send({code: 1, boleia});
	});
});

boleiaRouter.get("/getAll", (req,res)=>{
	boleiasDriver.boleia.getAllBoleias((err, boleias)=>{
		if(err)
			return res.status(500).send({...boleiaErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
		
		return res.send({code: 1, boleias});
	});
});

boleiaRouter.get("/hitchhikers/:boleiaId", auth_isLogged, account_isActive, (req,res)=>{
	if(!req.params.boleiaId)
		return req.status(400).send(boleiaErrors.invalidBoleiaId);
	
	boleiasDriver.boleia.getHitchhikersInBoleia(req.params.boleiaId, (err, hitchhickers)=>{
		if(err){
			if(err == dbError.invalidData)
				return res.status(400).send(err);
			return res.status(500).send({...boleiaErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
		}

		return res.send({code: 1, hitchhickers});
	});
});

boleiaRouter.delete("/cancel/:boleiaId", auth_isLogged, account_isActive, (req,res)=>{
	if(!req.params.boleiaId)
		return req.status(400).send(boleiaErrors.invalidBoleiaId);

	boleiasDriver.boleia.cancelBoleia(req.params.boleiaId, req.user[dbColumns.latest.Users.ID],(err,ok)=>{
		if(err){
			if(err == boleiaErrors.userNotOwner)
				return res.status(403).send(err);

			if(Object.values(boleiaErrors).includes(err) || Object.values(passportError).includes(err))
				return res.send(400).send(err);

			if(Object.keys(dbError).includes(err))
				return res.send(500).send(err);
			
			return res.status(500).send({...boleiaErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
		}

		if(!ok)
			return res.status(400).send(boleiaErrors.boleiaNotCanceled);
		
		return res.send({code:1, message: "Boleia was canceled."});
	});
});
// again. repeated code..
boleiaRouter.patch("/uncancel/:boleiaId", auth_isLogged, account_isActive, (req,res)=>{
	if(!req.params.boleiaId)
		return req.status(400).send(boleiaErrors.invalidBoleiaId);

	boleiasDriver.boleia.uncancelBoleia(Number(req.params.boleiaId), req.user[dbColumns.latest.Users.ID],(err,ok)=>{
		if(err){
			if(err == boleiaErrors.userNotOwner)
				return res.status(403).send(err);

			if(Object.keys(boleiaErrors).includes(err) || Object.keys(passportError).includes(err))
				return res.send(400).send(err);

			if(Object.keys(dbError).includes(err))
				return res.send(500).send(err);
			
			return res.status(500).send({...boleiaErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
		}

		if(!ok)
			return res.status(400).send(boleiaErrors.boleiaNotuncanceled);
		
		return res.send({code:1, message: "Boleia was uncanceled."});
	});
});

boleiaRouter.post("/join/:boleiaId", auth_isLogged, account_isActive, (req,res)=>{
	if(!req.params.boleiaId)
		return req.status(400).send(boleiaErrors.invalidBoleiaId);

	boleiasDriver.boleia.hitchRideIfNotAlready(Number(req.params.boleiaId), req.user[dbColumns.latest.Users.ID],(err,ok)=>{
		if(err){
			if(Object.values(boleiaErrors).includes(err) || Object.values(passportError).includes(err))
				return res.status(400).send(err);

			if(Object.values(dbError).includes(err))
				return res.status(500).send(err);
			
			return res.status(500).send({...boleiaErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
		}
		if(!ok)
			return res.status(400).send(boleiaErrors.couldnHitchhike);
		
		return res.send({code:1, message: "User registered on Boleia."});
	});
});

boleiaRouter.delete("/leave/:boleiaId", auth_isLogged, account_isActive, (req,res)=>{
	if(!req.params.boleiaId)
		return req.status(400).send(boleiaErrors.invalidBoleiaId);
	
	boleiasDriver.boleia.cancelHitch(req.params.boleiaId, req.user[dbColumns.latest.Users.ID], (err,ok)=>{
		if(err){
			if(err == boleiaErrors.userNotInBoleia)
				return res.status(403).send(err);

			if(Object.values(boleiaErrors).includes(err) || Object.values(passportError).includes(err))
				return res.send(400).send(err);

			if(Object.values(dbError).includes(err))
				return res.send(500).send(err);
			
			return res.status(500).send({...boleiaErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});
		}

		if(!ok)
			return res.status(400).send(boleiaErrors.couldntCancelHitch);
		
		return res.send({code:1, message: "User dropped from Boleia."});
	});
});

boleiaRouter.delete("/search", auth_isLogged, account_isActive, (req,res)=>{
	if(!req.body.maxRadius || !req.body.origin || !req.body.destination)
		return req.status(400).send(boleiaErrors.invalidRequestBody);
	
	boleiasDriver.boleia.getCloseBoleias(req.body.maxRadius, req.body.origin, req.body.destination, (err,boleias)=>{
		if(err == boleiaErrors.userNotInBoleia)
			return res.status(500).send({...boleiaErrors.unexptedError,...(leakInternalErrors?{internalErrors: err}:{})});

		return res.send({code: 1, boleias});
	});
});


module.exports = boleiaRouter;
