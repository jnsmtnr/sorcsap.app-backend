import bcrypt from 'bcrypt'

import getClient from '../../mongodb.js'
import signToken  from './_signToken.js'

export default async function(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json(({
            body: "OK"
        }))
    }

    if (req.method !== 'POST') return res.status(404).send('not found');

    const client = getClient()

    try {
        if (
            !(req.body && req.body.email && typeof req.body.email === 'string' && req.body.email.includes('@') && req.body.email.includes('.') && req.body.email.length <= 64)
            || !(req.body && req.body.password && typeof req.body.password === 'string' && req.body.password.length >= 8 && req.body.password.length <= 64)
        ) {
            throw new Error('Invalid e-mail address or password')
        }

        const email = req.body.email.trim().toLowerCase()

        await client.connect()

        const users = client.db().collection('users')

        const user = await users.findOne({ email })

        if (!user) {
            throw new Error('Invalid e-mail address or password')
        }

        if (await bcrypt.compare(req.body.password, user.password)) {
            const token = signToken(user._id.toString(), user.email, user.admin)
            const response = {
                message: 'Password is correct',
                token
            }
            if (user.admin) {
                response.admin = user.admin
            }
            res.status(200).send(response)
        } else {
            throw new Error('Invalid e-mail address or password')
        }
    }
    catch (error) {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close()
    }
}