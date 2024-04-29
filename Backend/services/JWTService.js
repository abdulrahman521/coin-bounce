const jwt = require('jsonwebtoken');
const {ACCESS_SECRETKEY, REFRESH_SECRETKEY} = require('../config/index');
const refreshtoken = require('../models/token');

class JWTService{
    //sign access token
    static signaccesstoken(playload, expirytime){
        return jwt.sign(playload, ACCESS_SECRETKEY, {expiresIn: expirytime});
    }

    //sign refresh token
    static signrefreshtoken(playload, expirytime){
        return jwt.sign(playload, REFRESH_SECRETKEY, {expiresIn: expirytime});
    }

    //verify access token
    static verifyaccesstoken(token){
        return jwt.verify(token, ACCESS_SECRETKEY);
    }

    //verify referesh token
    static verifyrefreshtoken(token){
        return jwt.verify(token, REFRESH_SECRETKEY);
    }

    //store refresh token
   static async storerefreshtoken(token,userid){
        try {
          const newtoken = new refreshtoken({
                token: token,
                userid: userid
            });

            //store in database
            await newtoken.save();
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = JWTService;