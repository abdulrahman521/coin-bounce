//const { required, ref } = require('joi');
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const refreshtokenschema = schema({
    token: {type: String, required: true},
    userid: {type: mongoose.SchemaTypes.ObjectId, ref: 'User'}
},
{timestamps: true}
);

module.exports = mongoose.model('Refresh Token', refreshtokenschema, 'tokens');