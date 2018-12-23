// dbconfs.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./DB/lct.db');

const {dbError} = require("../errors/codes");

const dbColumns = {
	latest: {
		VERSION: {
			VERSION: "version",
			CURRENT: "current"
		},
		Users: {
			_NAME: "Users",
			ID: "id",
			USERNAME: "username",
			NOME: "nome",
			PASS: "password",
			DATANASCP: "data_nascimento",
			DATACARTA: "data_carta",
			FOTO: "foto",
			DATACRI: "data_criacao",
			DATAMOD: "data_modificacao",
		},
		Boleia: {
			_NAME: "Boleia",
			ID: "id",
			CRIADOR: "criador",
			DEFINITIVO: "definitivo",
			DATAHORA: "data_hora",
			PRECO: "preco",
			ORIGEM: "origem",
			MAXPESS: "max_pess",
			DEST: "destino",
			DURPREV: "duracao_prevista",
			CONCL: "concluido",
			DESC: "descricao",
			DATACRI: "data_criacao",
			DATAMOD: "data_modificacao"
		},
		Hitchhiker: {
			_NAME: "Hitchhiker",
			USER: "user",
			BOLEIA: "boleia",
			DATACRI: "data_criacao"
		},
		Classificacoes: {
			_NAME: "Classificacoes",
			USER: "user",
			BOLEIA: "boleia",
			CLASSI: "classificacao",
			DATACRI: "data_criacao",
			DATAMOD: "data_modificacao",
		},
		Comentarios: {
			_NAME: "Comentarios",
			USER: "user",
			BOLEIA: "boleia",
			COMENT: "comentario",
			DATACRI: "data_criacao",
			DATAMOD: "data_modificacao"
		},
		Mensagens: {
			_NAME: "Mensagens",
			USER: "user",
			BOLEIA: "boleia",
			MSG: "mensagem",
			DATACRI: "data_criacao",
			DATAMOD: "data_modificacao"
		}
	}
};

let dbDriver = {
	user: {
		getByUsername: (username, cb = (err, username)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!username)
				return cb(dbError.usernameInvalid);
			db.get(
				`SELECT * FROM ${dbColumns.latest.Users._NAME} WHERE ${dbColumns.latest.Users.USERNAME} = ?`,
				[username],
				cb
			);
		},
		getById: (id, cb = (err, id)=>{})=>{ // eslint-disable-line handle-callback-err, no-unused-vars
			if(!id)
				return cb(dbError.idInvalid);
		
			db.get(
				`SELECT * FROM ${dbColumns.latest.Users._NAME} WHERE ${dbColumns.latest.Users.ID} = ?`,
				[id],
				cb
			);
		}
	}
};

module.exports = {
	db,
	dbColumns,
	dbDriver
};
