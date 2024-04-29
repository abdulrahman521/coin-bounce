const dotenv = require('dotenv').config();

const Port = process.env.PORT;
const MONGODB_CONNECTIONSTRING = process.env.MONGODB_CONNECTIONSTRING;
const ACCESS_SECRETKEY = process.env.ACCESS_SECRETKEY;
const REFRESH_SECRETKEY = process.env.REFRESH_SECRETKEY;
const BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH;

module.exports = {
    Port,
    MONGODB_CONNECTIONSTRING,
    ACCESS_SECRETKEY,
    REFRESH_SECRETKEY,
    BACKEND_SERVER_PATH
}