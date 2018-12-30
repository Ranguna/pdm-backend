// comentariosClient.js
const {db, dbColumns} = require("./dbconfs");
const userDriver = require("./userDriver");

const {dbError, passportError} = require("../errors/codes");
const {leakInternalErrors} = require("../config/globals");

let comentariosClient = {
	coment: {
		newComent: (
			idOwner,
			idBoleia,
			comment,
			cb = (err, boleia)=>{} // eslint-disable-line handle-callback-err, no-unused-vars
		)=>{
			if(!idOwner || !idBoleia || !comment)
				return cb(dbError.invalidData);

			//Verificar se o user está ativo
			userDriver.user.isActiveId(idOwner, (err, active)=>{
				if(err)
					return cb({...dbError.unexptedError, ...(leakInternalErrors?{internalError: err}:{})});
				
				if(!active)
					return cb(passportError.accountDeactivated);


				//user ativo
				db.run(`INSERT INTO ${dbColumns.latest.Comentarios._NAME} (` +
					`${dbColumns.latest.Comentarios.USER},` +
					`${dbColumns.latest.Comentarios.BOLEIA},` +
					`${dbColumns.latest.Comentarios.COMENT},` +
					`${dbColumns.latest.Comentarios.DATACRI},` +
					`${dbColumns.latest.Comentarios.DATAMOD}` +
				`) VALUES (?, ?, ?, ?, ?)`,
				[
					idOwner,
					idBoleia,
					comment,
					(new Date()).getTime(),
					(new Date()).getTime()
				],
				function(err){
					if(err)
						return cb(err.message);

					//VER SE PRECISA DE ALGO ADICIONAL AQUI
				}
				);
			});
		},
		getAllCommentsByBoleia: (
			id,
			cb = (err, boleia)=>{} // eslint-disable-line handle-callback-err, no-unused-vars
		)=>{
			if(!id)
				return cb(dbError.idInvalid);

			db.all(
				`SELECT * FROM ${dbColumns.latest.Comentarios._NAME} WHERE ${dbColumns.latest.Comentarios.BOLEIA} = ?`,
				[id],
				function(err, comentarios){
					if(err)
						return cb(err.message);
				
					Promise.all(comentarios).then(
						(resolved) => {
							return cb(null, resolved);
						}
					).catch(err=>{
						return cb(err);
					});
				}
			);
		}
	}
};

module.exports = comentariosClient;
