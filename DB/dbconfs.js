// dbconfs.js
const sqlite3 = require('sqlite3').verbose();

const express = require('express');
const dbRouter = express.Router();

const DB = new sqlite3.Database('./DB/lct.db');

dbRouter.post("/initDB", (req,res)=>{
	try {
		DB.serialize(function() {
			DB.run("CREATE TABLE Users ("+
				"id INTEGER PRIMARY KEY AUTOINCREMENT,"+
				"nome TEXT NOT NULL,"+
				"data_nascimento INTEGER NOT NULL,"+
				"data_carta INTEGER NOT NULL,"+
				"CONSTRAINT unique_users UNIQUE (id)"+
			")");
			DB.run("CREATE TABLE Boleia ("+
				"id INTEGER PRIMARY KEY AUTOINCREMENT,"+
				"creador INTEGER NOT NULL,"+
				"hora INTEGER NOT NULL,"+
				"preco REAL NOT NULL,"+
				"destino TEXT NOT NULL,"+
				"duracao_prevista INTEGER NOT NULL,"+
				"concluido NUMERIC DEFAULT 0,"+
				"FOREIGN KEY(creador) REFERENCES Users(id)"+
			")");
			DB.run("CREATE TABLE Hitchhiker ("+
				"user INTEGER NOT NULL,"+
				"boleia INTEGER NOT NULL,"+
				"FOREIGN KEY(user) REFERENCES Users(id),"+
				"FOREIGN KEY(boleia) REFERENCES Boleia(id)"+
			")");
			DB.run("CREATE TABLE Classificacoes ("+
				"user INTEGER NOT NULL,"+
				"boleia INTEGER NOT NULL,"+
				"classificacao INTEGER NOT NULL,"+
				"FOREIGN KEY(user) REFERENCES Users(id),"+
				"FOREIGN KEY(boleia) REFERENCES Boleia(id)"+
			")");
			res.status(201).send({message:"Tables created."});
		});
	} catch(e){
		res.status(500).send({message:"There was an error in the database", DBError: e});
	}

})

module.exports = {
	DB,
	dbRouter
}