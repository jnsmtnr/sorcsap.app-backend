import jwt from 'jsonwebtoken'

export default function signToken(id: string, email: string, isAdmin = false) {
    const payload: { id: string, email: string, admin?: boolean } = { id, email }

    if (isAdmin) {
        payload.admin = true
    }

    return jwt.sign(payload, process.env.JWT_PRIVATE_KEY!, { expiresIn: '7d' })
}
