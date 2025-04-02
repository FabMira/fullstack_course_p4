

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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}