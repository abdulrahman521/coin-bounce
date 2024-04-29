const express = require('express');
const authcontroller = require('../controller/authcontroller');
const auth = require('../middlewares/auth');
const blogcontroller = require('../controller/blogcontroller');
const commentcontroller = require('../controller/commentcontroller');

const router = express.Router();

//testing
router.get('/test', (req, res) => res.json({msg: 'Test Route Working'}));

//user

//register
router.post('/register', authcontroller.register);

//login
router.post('/login', authcontroller.login);

//logout
router.post('/logout', auth, authcontroller.logout);

//refresh
router.get('/refresh', authcontroller.refresh);

//blog

//create
router.post('/blog', auth, blogcontroller.create);

//get all blogs
router.get('/blog/all', auth, blogcontroller.getall);

//get blog by id
router.get('/blog/:id', auth, blogcontroller.getbyid);

//update
router.put('/blog', auth, blogcontroller.update);

//delete
router.delete('/blog/:id', auth, blogcontroller.delete);

//comment
//create comment
router.post('/comment', auth, commentcontroller.create);

//read comment by blog id
router.get('/comment/:id', auth, commentcontroller.getbyid);

module.exports = router;