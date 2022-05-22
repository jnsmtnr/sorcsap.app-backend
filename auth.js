import jwt from 'jsonwebtoken'

export default function auth(req) {
    if (!req.headers.authorization) {
        return false
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

        return true
    }
    catch(error) {
        return false
    }
}