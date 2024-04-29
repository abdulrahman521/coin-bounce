const jwtservice = require('../services/JWTService');
const User = require('../models/user');
const Userdto = require('../DTO/user');


const auth = async (req, res, next) => {
    //1. refresh, access token validation

    try {
        const {refreshtoken, accesstoken} = req.cookies;

        if(!refreshtoken || !accesstoken){
            const error = {
                status: 401,
                message: 'Unauthorized'
            }
    
            return next(error);
        }
        let _id;
        try {
           _id = jwtservice.verifyaccesstoken(accesstoken)._id;
        } catch (error) {
            return next(error);
        }
        let user;
        try {
            user = await User.findOne({_id: _id}); 
        } catch (error) {
            return next(error);
        }
    
        const userdto = new Userdto(user);
    
        req.user = userdto;
    
        next();
    
    } catch (error) {
        return next(error);
    }
}


module.exports = auth;
