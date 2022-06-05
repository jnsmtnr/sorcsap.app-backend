import { VercelRequest } from '@vercel/node'
import jwt, { JwtPayload } from 'jsonwebtoken'

interface Request extends VercelRequest {
    user: {
        email: string,
        id: string,
        admin?: boolean
    }
}

export default function auth(req: Request): boolean {
    if (!req.headers.authorization) {
        return false
    }

    try {
        const token = req.headers.authorization.split(' ')[1]
        const user = jwt.verify(token, process.env.JWT_PRIVATE_KEY!) as JwtPayload

        req.user = {
            email: user.email,
            id: user.id,
        }

        if (user.admin) {
            req.user.admin = true
        }

        return true

    }
    catch (error) {
        return false
    }
}