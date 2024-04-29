const joi = require('joi');
const Comment = require('../models/comment');
const commentdto = require('../DTO/comment');

const mongodbidpattern = /^[0-9a-fA-F]{24}$/;

const commentcontroller = {

    async create (req, res, next){
        const createcommentschema = joi.object({
            content: joi.string().required(),
            author: joi.string().regex(mongodbidpattern).required(),
            blog: joi.string().regex(mongodbidpattern).required()
        });

        const {error} = createcommentschema.validate(req.body);

        if(error){
            return next(error);
        }

        const {content, author, blog} = req.body;

        try {
            const newcomment = new Comment({
                content, author, blog
            });
            await newcomment.save();
        } catch (error) {
            return next(error);
        }

        return res.status(200).json({messaga: 'Comment Created'});
    },
    async getbyid (req, res, next){
        const getbyidschema = joi.object({
            id: joi.string().regex(mongodbidpattern).required()
        });

        const {error} = getbyidschema.validate(req.params);

        if(error){
            return next(error);
        }

        const {id} = req.params;

        let comments;
        try {
            comments = await Comment.find({blog: id}).populate('author');
        } catch (error) {
            return next(error);
        }

        let commentsdto = [];

        for(let i = 0; i < comments.length; i++){
            const obj = new commentdto(comments[i]);
            commentsdto.push(obj);
        }
        return res.status(200).json({data: commentsdto});
    }
}

module.exports = commentcontroller;