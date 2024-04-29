const joi = require('joi');
const fs = require('fs');
const blog = require('../models/blog');
const {BACKEND_SERVER_PATH} = require('../config/index');
const Blogdto = require('../DTO/blog');
const Blogdetaildto = require('../DTO/blog-detail');
const comment = require('../models/comment');

const mongodbidpattern = /^[0-9a-fA-F]{24}$/;

const blogcontroller = {
    async create(req, res, next){
        //1. validate req body
        const createblogschema = joi.object({
            title: joi.string().required(),
            author: joi.string().regex(mongodbidpattern).required(),
            content: joi.string().required(),
            photo: joi.string().required()
        });

        const {error} = createblogschema.validate(req.body);

        if(error){
            return next(error);
        }

        const {title, author, content, photo} = req.body;

       // workin on photo

       //read as buffer
       const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,''),'base64');

       //allot photo a random name
        const imagepath = `${Date.now()}-${author}.png`;

        //save locally
        try {
            fs.writeFileSync(`storage/${imagepath}`, buffer);
        } catch (error) {
            return next(error);
        }

        //add blog to database
        let newblog;
        try {
            newblog = new blog({
                title,
                author,
                content,
                photopath: `${BACKEND_SERVER_PATH}/storage/${imagepath}`
            });
            await newblog.save();
        } catch (error) {
            return next(error);
        }
        const blogdto = new Blogdto(newblog);

        return res.status(201).json({blog: blogdto});

    },
    async getall(req, res, next){
        try {
            const blogs = await blog.find({});

            const blogsdto = [];
            for(let i =0; i<blogs.length;i++){
                const dto = new Blogdto(blogs[i]);
                blogsdto.push(dto);
            }
            return res.status(200).json({blogs: blogsdto});
        } catch (error) {
            return next(error);
        }
    },
    async getbyid(req, res, next){
        //validate id
        //response

        const getbyidschema = joi.object({
            id: joi.string().regex(mongodbidpattern).required()
        });

        const {error} = getbyidschema.validate(req.params);

        if(error){
            return next(error);
        }

        let blogbyid;

        const {id} = req.params;
        try {
            blogbyid = await blog.findOne({_id: id}).populate('author');
        } catch (error) {
            return next(error);
        }

        const blogdetaildto = new Blogdetaildto(blogbyid);

        return res.status(200).json({blog: blogdetaildto});
    },
    async update(req, res, next){

        const updateblogschema = joi.object({
            title: joi.string().required(),
            content: joi.string().required(),
            author: joi.string().regex(mongodbidpattern).required(),
            blogid: joi.string().regex(mongodbidpattern).required(),
            photo: joi.string()
        });

        const {error} = updateblogschema.validate(req.body);

        const{title, content, author, blogid, photo} = req.body;

        let updateblog;
        try {
            updateblog = await blog.findOne({_id: blogid});

        } catch (error) {
            return next(error);
        }

        if(photo){
            let previousphoto = updateblog.photopath;

            previousphoto = previousphoto.split('/').at(-1);
            
            //delete photo
            fs.unlinkSync(`storage/${previousphoto}`);

            //save new photo
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');
            const imagepath= `${Date.now()}-${author}.png`;
            try {
                fs.writeFileSync(`storage/${imagepath}`, buffer);
            } catch (error) {
                return next(error);
            }
            
            await blog.updateOne({_id: blogid},
                {title, content, photopath: `${BACKEND_SERVER_PATH}/storage/${imagepath}`});
        }
        else{
            await blog.updateOne({_id: blogid},{title, content});
        }

        return res.status(200).json({message: 'Blog Updated'});
    },
    async delete(req, res, next){

        const deleteblogschema = joi.object({
            id: joi.string().regex(mongodbidpattern).required()
        });

        const {error} = deleteblogschema.validate(req.params);

        const {id} = req.params;

        try {
            await blog.deleteOne({_id: id});

            await comment.deleteMany({blog: id});

        } catch (error) {
            return next(error);
        }

        return res.status(200).json({message: 'Blog Deleted'});
    }
}

module.exports = blogcontroller;