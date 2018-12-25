// dbconfs.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./DB/lct.db');

const dbColumns = {
	latest: {
		VERSION: {
			VERSION: "version",
			CURRENT: "current"
		},
		Users: {
			_NAME: "Users",
			ID: "id",
			EMAIL: "email",
			NOME: "nome",
			PASS: "password",
			DATANASC: "data_nascimento",
			DATACARTA: "data_carta",
			FOTO: "foto",
			DATACRI: "data_criacao",
			DATAMOD: "data_modificacao",
			DATADES: "data_desativacao",
		},
		Boleia: {
			_NAME: "Boleia",
			ID: "id",
			CRIADOR: "criador",
			DEFINITIVO: "definitivo",
			DATAHORA: "data_hora",
			ORIGEM: "origem",
			MAXPESS: "max_pess",
			DEST: "destino",
			DURPREV: "duracao_prevista",
			CONCL: "concluido",
			DESC: "descricao",
			CANC: "cancelada",
			DATACRI: "data_criacao",
			DATAMOD: "data_modificacao"
		},
		Hitchhiker: {
			_NAME: "Hitchhiker",
			USER: "user",
			BOLEIA: "boleia",
			CANCL: "cancelado",
			DATACRI: "data_criacao",
			DATAMOD: "data_modificacao"
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

// placed here because of driver's circular dependencies
module.exports = {db, dbColumns};

// load drivers

// complete export
module.exports = {
	db,
	dbColumns,
};
