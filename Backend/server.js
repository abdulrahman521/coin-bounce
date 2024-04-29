const express = require('express');
const dbconnect = require('./database/index');
const {Port} = require('./config/index');
const router = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const cookieparser = require('cookie-parser');
const cookieParser = require('cookie-parser');

const app = express();

const PORT = Port;

app.use(cookieParser());
app.use(express.json());
app.use(router);
dbconnect();
app.use(errorHandler);
app.use('/storage', express.static('storage'));
app.listen(PORT,console.log(`Backend Port ${PORT} is running`));