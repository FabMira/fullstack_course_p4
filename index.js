const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/loggers')
const Blog = require('./models/blogs')

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})