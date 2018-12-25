// userDriver.js
const bcrypt = require("bcrypt");

const {db, dbColumns} = require("./dbconfs");
const regex = require("../config/regex");

const {dbError} = require("../errors/codes");
const {leakInternalErrors} = require("../config/globals");

let userDriver = {
	user: {
		newUser: (email, hpass, cb = (err)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(email == "")
				return cb({message:"Invalid email format."});

			db.run(`INSERT INTO ${dbColumns.latest.Users._NAME} (${dbColumns.latest.Users.EMAIL}, ${dbColumns.latest.Users.PASS}, ${dbColumns.latest.Users.DATACRI}, ${dbColumns.latest.Users.DATAMOD}) VALUES (?, ?, ?, ?)`,
				[
					email,
					hpass,
					(new Date()).getTime(),
					(new Date()).getTime()
				],
				cb
			);
		},
		getByEmail: (email, cb = (err, user)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!email)
				return cb(dbError.emailInvalid);

			db.get(
				`SELECT * FROM ${dbColumns.latest.Users._NAME} WHERE ${dbColumns.latest.Users.EMAIL} = ?`,
				[email],
				cb
			);
		},
		getById: (id, cb = (err, user)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!id)
				return cb(dbError.idInvalid);
		
			db.get(
				`SELECT * FROM ${dbColumns.latest.Users._NAME} WHERE ${dbColumns.latest.Users.ID} = ?`,
				[id],
				cb
			);
		},
		removeByEmail: (email, cb = (err, email)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!email)
				return cb(dbError.emailInvalid);
			
			db.run(
				`UPDATE  ${dbColumns.latest.Users._NAME} SET (${dbColumns.latest.Users.DATADES}, ${dbColumns.latest.Users.DATAMOD}) = (?, ?) WHERE ${dbColumns.latest.Users.EMAIL} = ?`,
				[
					(new Date()).getTime(),
					(new Date()).getTime(),
					email
				],
				function(err){
					cb(err && err.message, this.changes);
				}
			);
		},
		removeById: (Id, cb = (err, Id)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!Id)
				return cb(dbError.IdInvalid);
			
			db.run(
				`UPDATE  ${dbColumns.latest.Users._NAME} SET (${dbColumns.latest.Users.DATADES}, ${dbColumns.latest.Users.DATAMOD}) = (?,?) WHERE ${dbColumns.latest.Users.ID} = ?`,
				[
					(new Date()).getTime(),
					(new Date()).getTime(),
					Id
				],
				function(err){
					cb(err, this.changes);
				}
			);
		},
		activateByEmail: (email, password, cb = (err, email)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!email)
				return cb(dbError.invalidData);
			

			userDriver.user.getByEmail(email,(err, user)=>{
				if(err)
					return cb({...dbError.unexptedError, ...(leakInternalErrors?{internalError: err}:{})});
				
				if(!user)
					return cb(dbError.userNotFound);
				
				bcrypt.compare(password, user[dbColumns.latest.Users.PASS], (err, ok)=>{
					if(err)
						return cb({...dbError.unexptedError, ...(leakInternalErrors?{internalError: err}:{})});
					
					if(!ok)
						return cb(db.invalidPassword);
					
					db.run(
						`UPDATE  ${dbColumns.latest.Users._NAME} SET (${dbColumns.latest.Users.DATADES}, ${dbColumns.latest.Users.DATAMOD}) = (?, ?) WHERE ${dbColumns.latest.Users.EMAIL} = ? AND ${dbColumns.latest.Users.DATADES} <> -1`,
						[
							-1,
							(new Date()).getTime(),
							email
						],
						function(err){
							cb(err && err.message, this.changes);
						}
					);
				});
			});
		},
		isActiveEmail: (email, cb=(err, active)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			userDriver.user.getByEmail(email, (err, user)=>{
				if(err)
					return cb(err);

				return cb(null, user[dbColumns.latest.Users.DATADES] == -1);
			});
		},
		isActiveId: (Id, cb=(err, active)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			userDriver.user.getById(Id, (err, user)=>{
				if(err)
					return cb(err);
					
				return cb(null, user[dbColumns.latest.Users.DATADES] == -1);
			});
		},

		changeFields: (email, nome, nascimento, carta, cb=(err,rowsChanged)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!email || !nome || !nascimento || !carta)
				return cb(dbError.invalidData);

			if(nome != "" && !regex.user.test(nome))
				return cb({message: "Invalid format for 'nome'."});
			
			db.run(
				`UPDATE ${dbColumns.latest.Users._NAME} SET (`+
					`${dbColumns.latest.Users.NOME}, `+
					`${dbColumns.latest.Users.DATANASC}, `+
					`${dbColumns.latest.Users.DATACARTA}, `+
					`${dbColumns.latest.Users.DATAMOD}`+
				`) = (?,?,?,?) WHERE ${dbColumns.latest.Users.EMAIL} = ?`,
				[
					nome,
					nascimento,
					carta,
					(new Date()).getTime(),
					email
				],
				function(err){
					return cb(err && err.message, this.changes);
				}
			);
		},

		changePassword: (email, oldPassword, newPassword, cb=(err, changed)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!email || !oldPassword || !newPassword)
				return cb(dbError.invalidData);

			if(!regex.password.test(newPassword)){
				return cb({message: "Invalid format for 'password'."});
			}
			
			userDriver.user.getByEmail(email,(err, user)=>{
				if(err)
					return cb({...dbError.unexptedError, ...(leakInternalErrors?{internalError: err}:{})});
				
				bcrypt.compare(oldPassword, user[dbColumns.latest.Users.PASS], (err, ok)=>{
					if(err)
						return cb({...dbError.unexptedError, ...(leakInternalErrors?{internalError: err}:{})});
					
					if(!ok)
						return cb(dbError.invalidPassword);

					bcrypt.hash(newPassword, 11, (err, hpass)=>{
						if(err)
							return cb(err);
						
						db.run(
							`UPDATE ${dbColumns.latest.Users._NAME} SET (`+
								`${dbColumns.latest.Users.PASS}, `+
								`${dbColumns.latest.Users.DATAMOD}`+
							`) = (?,?) WHERE ${dbColumns.latest.Users.EMAIL} = ?`,
							[
								hpass,
								(new Date()).getTime(),
								email
							],
							function(err){
								return cb(err && err.message, this.change);
							}
						);
					});
					
				});
			});

			
		}
	}
};

module.exports = userDriver;
