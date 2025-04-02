const _ = require('lodash')

const dummy = (blogs) => {
    return 1;
}

const totalLikes = (blogs) => {
    return blogs.reduce(
        (total, blog) => total + blog.likes,
        0,
    );
}

const favoriteBlog = (blogs) => {
    return blogs.reduce(
        (max, current) => current.likes > max.likes 
            ? current
            : max
    );
}

const mostBlogs = (blogs) => {
    return _.maxBy(
        _.map(
            _.groupBy(
                blogs, 'author'), 
                (blogs, author) => ({ 
                    author, 
                    posts: blogs.length 
                }
            )
        ), 'posts')
            .author;
}

const mostLikes = (blogs) => {
    
    return _.maxBy(
        _.map(
            _.groupBy(
                blogs, 'author'), (blogs, author) => ({
                    author,
                    likes: blogs.reduce(
                        (total, parcial) => total + parcial.likes, 0
                    )
                })
        ), 'likes');
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}