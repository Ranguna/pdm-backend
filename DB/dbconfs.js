// dbconfs.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./DB/lct.db');

module.exports = db;
