const jwt = require('jsonwebtoken')

function auth(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'User is not authenticated' })
    }

    try {
        const token = req.headers.authorization.split(' ')[1]
        const user = jwt.verify(token, process.env.JWT_PRIVATE_KEY)

        req.user = {
            email: user.email
        }

        next()
    }
    catch(error) {
        res.status(403).send({ message: 'User is not authorized' })
    }
}

module.exports = auth
