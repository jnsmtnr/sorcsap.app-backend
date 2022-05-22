import jwt from 'jsonwebtoken'

export default function signToken(id, email, isAdmin = false) {
    const payload = { id, email }

    if (isAdmin) {
        payload.admin = true
    }

    return jwt.sign(payload, process.env.JWT_PRIVATE_KEY, { expiresIn: '7d' })
}
