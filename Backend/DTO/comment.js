class commentdto {
    constructor(comment){
        this._id = comment._id;
        this.createdAt = comment.createdAt;
        this.content = comment.content;
        this.authorusername = comment.author.username;
    }
}

module.exports = commentdto;