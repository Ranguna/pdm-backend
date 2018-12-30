// classificacaoesClient.js
const {db, dbColumns} = require("./dbconfs");
const userDriver = require("./userDriver");

const {dbError, passportError} = require("../errors/codes");
const {leakInternalErrors} = require("../config/globals");

let classificacaoDriver = {
	classi: {
		newClassi: (
			idOwner,
			idBoleia,
			classi,
			cb = (err, boleia)=>{} // eslint-disable-line handle-callback-err, no-unused-vars
		)=>{
			if(!idOwner || !idBoleia || !classi)
				return cb(dbError.invalidData);

			//Verificar se o user está ativo
			userDriver.user.isActiveId(idOwner, (err, active)=>{
				if(err)
					return cb({...dbError.unexptedError, ...(leakInternalErrors?{internalError: err}:{})});
				
				if(!active)
					return cb(passportError.accountDeactivated);


				//user ativo
				db.run(`INSERT INTO ${dbColumns.latest.Classificacoes._NAME} (` +
					`${dbColumns.latest.Classificacoes.USER},` +
					`${dbColumns.latest.Classificacoes.BOLEIA},` +
					`${dbColumns.latest.Classificacoes.CLASSI},` +
					`${dbColumns.latest.Classificacoes.DATACRI},` +
					`${dbColumns.latest.Classificacoes.DATAMOD}` +
				`) VALUES (?, ?, ?, ?, ?)`,
				[
					idOwner,
					idBoleia,
					classi,
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
		getAllClassificationsByIdBoleia: (
			id,
			cb = (err, boleia)=>{} // eslint-disable-line handle-callback-err, no-unused-vars
		)=>{
			if(!id)
				return cb(dbError.idInvalid);
			db.get(
				`SELECT * FROM ${dbColumns.latest.Classificacoes._NAME} WHERE ${dbColumns.latest.Classificacoes.BOLEIA} = ?`,
				[id],
				function(err, row){
					return cb(err && err.message, row);
				}
			);
		}
	}
};

module.exports = classificacaoDriver;
