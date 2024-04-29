const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
//const userdto = require('../DTO/user');
const UserDTO = require('../DTO/user');
const jwtservices = require('../services/JWTService');
const refreshToken = require('../models/token');

const passordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authcontroller = {
    async register(req, res, next)
    {
        const userRegistrationSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().required(),
            password: Joi.string().pattern(passordPattern).required(),
            confirmpassword: Joi.ref('password')
        });

        const{error} = userRegistrationSchema.validate(req.body);
        
        //2. if error on validation -> return error via middleware
        if(error)
        {
            return next(error);
        }

        //3. if email or username already registered -> return an error
        const {username, name, email, password} = req.body;
        try {
            const emailinuse = await User.exists({email})
            const usernameinuse = await User.exists({username});

            if(emailinuse){
                const error = {
                    status: 409,
                    message: 'Email already registered, use another email'
                }
                return next(error);
            }
            if(usernameinuse){
                const error ={
                    status: 409,
                    message: 'Username not available. choose another username'
                }
                return next(error);
            }
        } catch (error) {
            return next(error);
        }
        //3. Password Hash
        const hashpassword = await bcrypt.hash(password, 10);

        //4. Store Data in Database
        let accesstoken;
        let refreshtoken;
        let user;

        try {
            const usertoregister = new User({
                username: username,
                email: email,
                name: name,
                password: hashpassword
            });
            user = await usertoregister.save();

            //token generation
            accesstoken = jwtservices.signaccesstoken({_id: user._id}, '30m');
            refreshtoken = jwtservices.signrefreshtoken({_id: user._id},'60m');
        
        } catch (error) {
            return next(error);
        }
        
        //store refresh token in database
        await jwtservices.storerefreshtoken(refreshtoken, user._id);

        //send cookie
        res.cookie('accessToken', accesstoken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });
        res.cookie('refreshtoken', refreshtoken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });

        //5. Response
        const Userdto = new UserDTO(user);

        return res.status(201).json({user: Userdto, auth: true});
    },
    async login(req, res, next)
    {
        // 1. Validate user input
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passordPattern)
        });
        const {error} = userLoginSchema.validate(req.body);

        if(error){
            return next(error);
        }
        const username = req.body.username;
        const password = req.body.password;
        //second method
        //const {username, password} = req.body;

        let user;

        try {
            //match username
           user = await User.findOne({username: username});
        
           if(!user){
                const error = {
                    status: 401,
                    message: 'Invalid username'
                }

                return next(error);
           }

           const match = await bcrypt.compare(password, user.password);
           if(!match){
            const error = {
                status: 401,
                message: 'Invalid password'
            }
            return next(error);
           }

        } 
        catch (error) {
            return next(error);
        }

        const accesstoken = jwtservices.signaccesstoken({_id: user._id}, '30m');
        const refreshtoken = jwtservices.signrefreshtoken({_id: user._id}, '60m');

        //update refresh token in database
        try {
          await refreshToken.updateOne({
                _id: user._id
            },
            {token: refreshtoken},
            {upsert: true}
        );
        } catch (error) {
            return next(error);
        }
        
        //send cookie

        res.cookie('accesstoken', accesstoken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });
        res.cookie('refreshtoken', refreshtoken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });

        const Userdto = new UserDTO(user);

        return res.status(200).json({user: Userdto, auth: true});
    },

    async logout(req, res, next){

        //console.log(req);
        //1. delete refresh token
        const {refreshtoken} = req.cookies;

        try {
            await refreshToken.deleteOne({token: refreshtoken});
        } catch (error) {
            return next(error);
        }

        //2. delete cookies
        res.clearCookie('accestoken');
        res.clearCookie('refreshtoken');

        //3. response to user
        res.status(200).json({user: null, auth: false});
    },

    async refresh(req, res, next){
        //1. get refreshtoken from cookies
        const originalrefreshtoken = req.cookies.refreshtoken;
        
        //2. verify refreshtoken
        let id;
        try {
            id = jwtservices.verifyrefreshtoken(originalrefreshtoken)._id;
        } catch (e) {
            const error = {
                status: 401,
                message: 'Unauthorized'
            }
            return next(error);
        }

        try {
           const match = refreshToken.findOne({_id: id, token: originalrefreshtoken});

           if(!match){
            const error = {
                status: 401,
                message: 'Unauthorized'
            }
            return next(error);
           }
            const accesstoken = jwtservices.signaccesstoken({_id: id}, '30m');
            const refreshtoken = jwtservices.signrefreshtoken({_id: id}, '60m');

            await refreshToken.updateOne({_id: id}, {token: refreshtoken});

            //4. update database
            res.cookie('accesstoken', accesstoken, {
                maxAge:1000 * 60 * 60 * 24,
                httpOnly: true
            });
            res.cookie('refreshtoken', refreshtoken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            });
        } catch (e) {
            return next(e);
        }

        //5. response
        const user = await User.findOne({_id: id});
        const userdto = new UserDTO(user);

        return res.status(200).json({user: userdto, auth: true});
    }
}

module.exports = authcontroller;