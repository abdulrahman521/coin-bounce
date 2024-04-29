
class blogdetaildto {
    constructor (blog){
        this._id = blog._id;
        this.content = blog.content;
        this.title = blog.title;
        this.photo = blog.photopath;
        this.createdAt = blog.createdAt;
        this.authorname = blog.author.name;
        this.authorusername = blog.author.username;
    }
}

module.exports = blogdetaildto;