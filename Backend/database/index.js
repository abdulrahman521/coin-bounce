const mongoose = require('mongoose');
const {MONGODB_CONNECTIONSTRING} = require('../config/index');

const dbconnect = async() => {

    try {
        const conn = await mongoose.connect(MONGODB_CONNECTIONSTRING);
        console.log(`Database connected to host: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error: ${error}`);
    }
}

module.exports = dbconnect;