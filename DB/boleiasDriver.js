// userDriver.js
const {db, dbColumns} = require("./dbconfs");
const userDriver = require("./userDriver");

const {computeDistanceBetween} = require("spherical-geometry-js");

const {dbError, boleiaErrors, passportError} = require("../errors/codes");
const {leakInternalErrors} = require("../config/globals");

let boleiaDriver = {
	boleia: {
		newBoleia: (
			idOwner,
			dateTime,
			maxPeople,
			orign,
			destination,
			description = "",
			cb = (err, boleia)=>{} // eslint-disable-line handle-callback-err, no-unused-vars
		)=>{
			if(!idOwner || !dateTime || !maxPeople || !orign || !destination)
				return cb(dbError.invalidData);

			// see if user exists and is active
			userDriver.user.isActiveId(idOwner,(err,active)=>{
				if(err)
					return cb({...dbError.unexptedError, ...(leakInternalErrors?{internalError: err}:{})});

				if(!active)
					return cb(passportError.accountDeactivated);
				
				// it's active
				// create boleia
				db.run(`INSERT INTO ${dbColumns.latest.Boleia._NAME} (`+
					`${dbColumns.latest.Boleia.CRIADOR},`+
					`${dbColumns.latest.Boleia.DATAHORA},`+
					`${dbColumns.latest.Boleia.MAXPESS},`+
					`${dbColumns.latest.Boleia.ORIGEM},`+
					`${dbColumns.latest.Boleia.DEST},`+
					`${dbColumns.latest.Boleia.DESC},`+
					`${dbColumns.latest.Boleia.DATACRI},`+
					`${dbColumns.latest.Boleia.DATAMOD}`+
				`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					idOwner,
					dateTime,
					maxPeople,
					orign,
					destination,
					description,
					(new Date()).getTime(),
					(new Date()).getTime()
				],
				function(err){
					if(err)
						return cb(err.message);
					boleiaDriver.boleia.getBoleiaById(this.lastID, cb);
				});
			});
		},
		/**
		 * Hitchhicker callback
		 * @callback hitchhickerCb
		 * @param {String} err
		 * @param {[{userId:String, userNome:String}]} Hitchhikers
		 */
		/**
		 * Get Boleia hitchhikers
		 * @param {Number} id Id of boleia
		 * @param {hitchhickerCb} cb Callback with err or list of hitchhikers
		 */
		getHitchhikersInBoleia: (id, cb = (err, hitchhikers)=>{})=>{// eslint-disable-line handle-callback-err, no-unused-vars
			if(!id)
				return cb(dbError.idInvalid);

			db.all( // sql, y u lik dis...
				`SELECT `+
					`userTable.${dbColumns.latest.Users.ID},`+
					`userTable.${dbColumns.latest.Users.NOME} `+
				`FROM `+
					`${dbColumns.latest.Hitchhiker._NAME} AS hitch `+
				`JOIN ${dbColumns.latest.Users._NAME} AS userTable `+
					`ON userTable.${dbColumns.latest.Users.ID} = hitch.${dbColumns.latest.Hitchhiker.USER} `+
				`WHERE ${dbColumns.latest.Hitchhiker.BOLEIA} = ?`,
				[id],
				function(err, hitchhikers){
					return cb(err && err.message, hitchhikers);
				}
			);
		},
		getHitchhikersInBoleiaPromised: (id)=>{
			return new Promise(function(resolve, reject){
				if(!id)
					return reject(dbError.idInvalid);
				db.all( // sql, y u lik dis...
					`SELECT `+
						`userTable.${dbColumns.latest.Users.ID},`+
						`userTable.${dbColumns.latest.Users.NOME}, `+
						`userTable.${dbColumns.latest.Users.EMAIL} `+
					`FROM `+
						`${dbColumns.latest.Hitchhiker._NAME} AS hitch `+
					`JOIN ${dbColumns.latest.Users._NAME} AS userTable `+
						`ON userTable.${dbColumns.latest.Users.ID} = hitch.${dbColumns.latest.Hitchhiker.USER} `+
					`WHERE ${dbColumns.latest.Hitchhiker.BOLEIA} = ? AND ${dbColumns.latest.Hitchhiker.CANCL} <> 1`,
					[id],
					function(err, hitchhikers){
						if(err)
							return reject(err.message);
						
						resolve(hitchhikers);
					}
				);
			});
		},
		getBoleiaById: (
			id,
			cb = (err, boleia)=>{} // eslint-disable-line handle-callback-err, no-unused-vars
		)=>{
			if(!id)
				return cb(dbError.idInvalid);
			db.get(
				`SELECT * FROM ${dbColumns.latest.Boleia._NAME} WHERE ${dbColumns.latest.Boleia.ID} = ?`,
				[id],
				function(err,row){
					return cb(err && err.message, row);
				}
			);
		},
		getAllBoleias: (cb = (err, boleias)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			db.all(
				`SELECT uT.${dbColumns.latest.Users.NOME}, uT.${dbColumns.latest.Users.EMAIL}, bT.* FROM ${dbColumns.latest.Boleia._NAME} AS bT `+
				`JOIN ${dbColumns.latest.Users._NAME} as uT `+
					`ON uT.${dbColumns.latest.Users.ID} = bT.${dbColumns.latest.Boleia.CRIADOR} `+
				`WHERE ${dbColumns.latest.Boleia.CANC} <> 1`,
				// eslint-disable-next-line require-await
				function(err,boleias){
					if(err)
						return cb(err.message);

					let diderr = false;
					let boleiasAndHitchhikersPromise = boleias.map(async (boleia)=>{
						if(diderr)
							return;

						try {
							// let hitchhikers;
							let hitchhikers = await boleiaDriver.boleia.getHitchhikersInBoleiaPromised(boleia[dbColumns.latest.Boleia.ID]);
							return {...boleia, hitchhikers};
						} catch(e){
							diderr = true;
							return cb(err);
						}
					});

					if(diderr)
						return;

					Promise.all(boleiasAndHitchhikersPromise).then(
						(resolved) => {
							return cb(null, resolved);
						}
					).catch(err=>{
						return cb(err);
					});
				}
			);
		},
		isCanceled: (id, cb = (err, canceled)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!id)
				return cb(boleiaErrors.invalidBoleiaId);
			
			boleiaDriver.boleia.getBoleiaById(id,(err, boleia)=>{
				if(err)
					return cb(err.message);
				
				return cb(err && err.message, boleia[dbColumns.latest.Boleia.CANC] == 1);
			});
		},
		cancelBoleia: (boleiaId, ownerId, cb = (err, changed)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!boleiaId)
				return cb(boleiaErrors.invalidBoleiaId);
			
			db.serialize(()=>{
				db.get(
					`SELECT ${dbColumns.latest.Boleia.CRIADOR} FROM ${dbColumns.latest.Boleia._NAME} WHERE ${dbColumns.latest.Boleia.CRIADOR} = ?`,
					[ownerId],
					function(err, boleia){
						if(err)
							return cb(err.message);
						
						if(!boleia)
							return cb(boleiaErrors.userNotOwner);
						
						db.run(
							`UPDATE `+
								`${dbColumns.latest.Boleia._NAME} `+
							`SET `+
								`${dbColumns.latest.Boleia.CANC} = 1, `+
								`${dbColumns.latest.Boleia.DATAMOD} = ? `+
							`WHERE ${dbColumns.latest.Boleia.CANC} = 0 AND ${dbColumns.latest.Boleia.ID} = ? AND ${dbColumns.latest.Boleia.CRIADOR} = ? AND ${dbColumns.latest.Boleia.CONCL} <> 1`,
							[(new Date()).getTime(), boleiaId, ownerId],
							function(err){
								return cb(err && err.message, this.changes != 0);
							}
						);	
					}
				);
			});
		},
		// vvv repeated code here vvvv
		// 2 byte difference between this function and the cancelBoleia function
		// could be worse..
		uncancelBoleia: (boleiaId, ownerId, cb = (err, changed)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!boleiaId)
				return cb(boleiaErrors.invalidBoleiaId);
			
			db.serialize(()=>{
				db.get(
					`SELECT ${dbColumns.latest.Boleia.CRIADOR} FROM ${dbColumns.latest.Boleia._NAME} WHERE ${dbColumns.latest.Boleia.CRIADOR} = ?`,
					[ownerId],
					function(err, boleia){
						if(err)
							return cb(err.message);
						
						if(!boleia)
							return cb(boleiaErrors.userNotOwner);
						
						db.run(
							`UPDATE `+
								`${dbColumns.latest.Boleia._NAME} `+
							`SET `+
								`${dbColumns.latest.Boleia.CANC} = 0, `+
								`${dbColumns.latest.Boleia.DATAMOD} = ? `+
							`WHERE ${dbColumns.latest.Boleia.CANC} = 1 AND ${dbColumns.latest.Boleia.ID} = ? AND ${dbColumns.latest.Boleia.CRIADOR} = ? AND ${dbColumns.latest.Boleia.CONCL} <> 1`,
							[(new Date()).getTime(), boleiaId, ownerId],
							function(err){
								return cb(err && err.message, this.changes != 0);
							}
						);	
					}
				);
			});
		},
		hasHitchhiker: (boleiaId, userId, cb = (err, isInBoleia)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!boleiaId)
				return cb(boleiaErrors.invalidBoleiaId);
			if(!userId)
				return cb(boleiaErrors.invalidUserId);
			
			db.get( // sql, y u lik dis...
				`SELECT `+
					`* `+
				`FROM `+
					`${dbColumns.latest.Hitchhiker._NAME} `+
				`WHERE `+
					`${dbColumns.latest.Hitchhiker.BOLEIA} = ? AND ${dbColumns.latest.Hitchhiker.USER} = ?`,
				[boleiaId, userId],
				function(err, hitchhiker){
					return cb(err && err.message, hitchhiker);
				}
			);
		},
		isBoleiaFull: (boleiaId, cb = (err, full)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!boleiaId)
				return cb(boleiaErrors.invalidBoleiaId);
			
			// oh please ACId
			boleiaDriver.boleia.getHitchhikersInBoleia(boleiaId,(err, hitchhickers)=>{
				if(err)
					return cb(err.message);
				
				boleiaDriver.boleia.getBoleiaById(boleiaId, (err,boleia)=>{
					if(err)
						return cb(err.message);

					return cb(err, boleia[dbColumns.latest.Boleia.MAXPESS] == hitchhickers.length);
				});
			});
		},
		hitchRideIfNotAlready: (boleiaId, userId, cb = (err, ok)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!boleiaId)
				return cb(boleiaErrors.invalidBoleiaId);
			if(!userId)
				return cb(boleiaErrors.invalidUserId);

			// let it be ACId.. please..
			db.serialize(()=>{
				// is user active
				userDriver.user.isActiveId(userId, (err,active)=>{
					if(err)
						return cb(err);
					if(!active)
						return cb(passportError.accountDeactivated);
					// is boleia full
					boleiaDriver.boleia.isBoleiaFull(boleiaId, (err, full)=>{
						if(err)
							return cb(err);
						
						if(full)
							return cb(boleiaErrors.boleiaIsFull);
						
						// is user already in boleia
						boleiaDriver.boleia.hasHitchhiker(boleiaId, userId, (err, isInBoleia)=>{
							if(err)
								return cb(err);

							if(isInBoleia){
								if(isInBoleia[dbColumns.latest.Hitchhiker.CANCL] !== 1)
									return cb(boleiaErrors.userAlreadyInBoleia);
								
								// get back on boleia if dropped
								return boleiaDriver.boleia.uncancelHitch(boleiaId, userId, cb);
							}
							
							boleiaDriver.boleia.isCanceled(boleiaId, (err, canceled)=>{
								if(err)
									return cb(err);

								if(canceled)
									return cb(boleiaErrors.boleiaCanceled);
								
								// finally
								db.run(
									`INSERT INTO ${dbColumns.latest.Hitchhiker._NAME} (`+
										`${dbColumns.latest.Hitchhiker.USER}, `+
										`${dbColumns.latest.Hitchhiker.BOLEIA}, `+
										`${dbColumns.latest.Hitchhiker.DATACRI}, `+
										`${dbColumns.latest.Hitchhiker.DATAMOD}`+
									`) VALUES (?, ?, ?, ?)`,
									[
										userId,
										boleiaId,
										(new Date()).getTime(),
										(new Date()).getTime()
									],
									function(err){
										return cb(err && err.message, this.changes != 0);
									}
								);
							});
						});
					});
				});
			});
		},
		cancelHitch: (boleiaId, userId, cb = (err, ok)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!boleiaId)
				return cb(boleiaErrors.invalidBoleiaId);
			if(!userId)
				return cb(boleiaErrors.invalidUserId);
			
			boleiaDriver.boleia.hasHitchhiker(boleiaId, userId,(err,isInBoleia)=>{
				if(err)
					return cb(err.message);
				
				if(!isInBoleia)
					return cb(boleiaErrors.userNotInBoleia);

				db.run(
					`UPDATE ${dbColumns.latest.Hitchhiker._NAME} SET `+
						`${dbColumns.latest.Hitchhiker.CANCL} = 1, `+
						`${dbColumns.latest.Hitchhiker.DATAMOD} = ? `+
					`WHERE `+
						`${dbColumns.latest.Hitchhiker.CANCL} <> 1 AND ${dbColumns.latest.Hitchhiker.USER} = ? AND ${dbColumns.latest.Hitchhiker.BOLEIA} = ?`,
					[(new Date()).getTime(), userId, boleiaId],
					function(err){
						return cb(err && err.message, this.changes != 0);
					}
				);
			});
		},
		// repeated code..
		uncancelHitch: (boleiaId, userId, cb = (err, ok)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!boleiaId)
				return cb(boleiaErrors.invalidBoleiaId);
			if(!userId)
				return cb(boleiaErrors.invalidUserId);
			
			boleiaDriver.boleia.hasHitchhiker(boleiaId, userId,(err,isInBoleia)=>{
				if(err)
					return cb(err.message);
				
				if(!isInBoleia)
					return cb(boleiaErrors.userNotInBoleia);

				db.run(
					`UPDATE ${dbColumns.latest.Hitchhiker._NAME} SET `+
						`${dbColumns.latest.Hitchhiker.CANCL} = 0, `+
						`${dbColumns.latest.Hitchhiker.DATAMOD} = ? `+
					`WHERE `+
						`${dbColumns.latest.Hitchhiker.CANCL} <> 0 AND ${dbColumns.latest.Hitchhiker.USER} = ? AND ${dbColumns.latest.Hitchhiker.BOLEIA} = ?`,
					[(new Date()).getTime(), userId, boleiaId],
					function(err){
						return cb(err && err.message, this.changes != 0);
					}
				);
			});
		},

		getCloseBoleias: (maxRadius, origin, destination, cb=(err,boleias)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!maxRadius || !origin || !destination)
				return cb(boleiaErrors.invalidRequestBody);

			// if(/^\d+(\.\d+){0,1}:\d+(\.\d+){0,1}$/u.test(origin))
			// 	return cb(boleiaErrors.invalidCoordinate);
			
			return boleiaDriver.boleia.getAllBoleias((err, boleias)=>{
				if(err)
					return cb(err);

				return cb(null,
					boleias.filter((boleia)=>{
						return (
							computeDistanceBetween(origin.split(":"), boleia[dbColumns.latest.Boleia.ORIGEM].split(":")) <= maxRadius*1000 &&
							boleia[dbColumns.latest.Boleia.DEST] == destination &&
							boleia.hitchhikers.length < boleia[dbColumns.latest.Boleia.MAXPESS]
						);
					})
				);
			});
		}
	}
};

module.exports = boleiaDriver;
