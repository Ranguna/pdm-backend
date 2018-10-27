
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4020;

const {dbRouter} = require("./routes/dbRouter");

// Express initializations
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// routes
app.use("/db",dbRouter);

// Express routing
app.get("/ping",(req,res)=>{
	return res.status(200).send({message: "All channels working properly."});
});

// Server listening
app.listen(PORT, ()=>{
	console.log(`Listening on ${PORT}`);
});



