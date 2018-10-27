// dbRouter.js
const express = require('express');
const dbRouter = new express.Router();

const {db} = require('../DB/lct.db');

dbRouter.post("/initDB", (req,res)=>{
	try {
		db.serialize(()=>{
			db.run("CREATE TABLE IF NOT EXISTS Users ("+
				"id INTEGER PRIMARY KEY AUTOINCREMENT,"+
				"nome TEXT DEFAULT '',"+
				"data_nascimento INTEGER DEFAULT -1,"+
				"data_carta INTEGER DEFAULT -1,"+
				"foto TEXT NOT NULL"+
				"data_criacao INTEGER NOT NULL,"+
				"data_modificacao INTEGER NOT NULL,"+
				"CONSTRAINT unique_users UNIQUE (id)"+
			")");
			db.run("CREATE TABLE IF NOT EXISTS Boleia ("+
				"id INTEGER PRIMARY KEY AUTOINCREMENT,"+
				"criador INTEGER NOT NULL,"+
				"definitivo INTEGER DEFAULT 0"+
				"data_hora INTEGER NOT NULL,"+
				"preco INTEGER NOT NULL,"+
				"origem TEXT NOT NULL,"+
				"max_pass INTEGER NOT NULL"+
				"destino TEXT NOT NULL,"+
				"duracao_prevista INTEGER NOT NULL,"+
				"concluido NUMERIC DEFAULT 0,"+
				"descricao TEXT NOT NULL"+
				"data_criacao INTEGER NOT NULL,"+
				"data_modificacao INTEGER NOT NULL,"+
				"FOREIGN KEY(criador) REFERENCES Users(id)"+
				"CONSTRAINT unique_boleias UNIQUE (id)"+
			")");
			db.run("CREATE TABLE IF NOT EXISTS Hitchhiker ("+
				"user INTEGER NOT NULL,"+
				"boleia INTEGER NOT NULL,"+
				"data_criacao INTEGER NOT NULL,"+
				"data_modificacao INTEGER NOT NULL,"+
				"FOREIGN KEY(user) REFERENCES Users(id),"+
				"FOREIGN KEY(boleia) REFERENCES Boleia(id)"+
			")");
			db.run("CREATE TABLE IF NOT EXISTS Classificacoes ("+
				"user INTEGER NOT NULL,"+
				"boleia INTEGER NOT NULL,"+
				"classificacao INTEGER NOT NULL,"+
				"data_criacao INTEGER NOT NULL,"+
				"data_modificacao INTEGER NOT NULL,"+
				"FOREIGN KEY(user) REFERENCES Users(id),"+
				"FOREIGN KEY(boleia) REFERENCES Boleia(id)"+
			")");
			db.run("CREATE TABLE IF NOT EXISTS Comentarios ("+
				"user INTEGER NOT NULL,"+
				"boleia INTEGER NOT NULL,"+
				"comentario TEXT NOT NULL,"+
				"data_criacao INTEGER NOT NULL,"+
				"data_modificacao INTEGER NOT NULL,"+
				"FOREIGN KEY(user) REFERENCES Users(id),"+
				"FOREIGN KEY(boleia) REFERENCES Boleia(id)"+
			")");
			db.run("CREATE TABLE IF NOT EXISTS Mensagens ("+
				"user INTEGER NOT NULL,"+
				"boleia INTEGER NOT NULL,"+
				"mensagem TEXT NOT NULL,"+
				"data_criacao INTEGER NOT NULL,"+
				"data_modificacao INTEGER NOT NULL,"+
				"FOREIGN KEY(user) REFERENCES Users(id),"+
				"FOREIGN KEY(boleia) REFERENCES Boleia(id)"+
			")");
			res.status(201).send({message:"Tables created."});
		});
	} catch(e){
		res.status(500).send({message:"There was an error in the database", DBError: e});
	}
});

module.exports = dbRouter;
