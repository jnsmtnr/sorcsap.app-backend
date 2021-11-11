import jwt from 'jsonwebtoken'

export function auth(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'User is not authenticated' })
    }

    try {
        const token = req.headers.authorization.split(' ')[1]
        const user = jwt.verify(token, process.env.JWT_PRIVATE_KEY)

        req.user = {
            email: user.email,
            id: user.id,
        }

        if (user.admin) {
            req.user.admin = true
        }

        next()
    }
    catch(error) {
        res.status(403).send({ message: 'User is not authorized' })
    }
}

export function isAdmin(req, res, next) {
    if (req.user.admin) {
        return next()
    }
    res.status(403).send({ message: 'User is not admin' })
}
