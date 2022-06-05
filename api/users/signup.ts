import { VercelResponse } from '@vercel/node'
import bcrypt from 'bcrypt'

import getClient from '../../mongodb'
import { Request } from '../../types'
import signToken  from './_signToken'

export default async function(req: Request, res: VercelResponse) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json(({
            body: "OK"
        }))
    }

    if (req.method !== 'POST') return res.status(404).send('not found');

    const client = getClient()

    try {
        // validate email
        if (!(req.body && req.body.email && typeof req.body.email === 'string' && req.body.email.includes('@') && req.body.email.includes('.') && req.body.email.length <= 64)) {
            throw new Error('Invalid e-mail address')
        }

        // validate password
        if (!(req.body && req.body.password && typeof req.body.password === 'string' && req.body.password.length >= 8 && req.body.password.length <= 64)) {
            throw new Error('Password must be at least 8 characters long')
        }

        const email = req.body.email.trim().toLowerCase()

        await client.connect()

        const users = client.db().collection('users')

        const user = await users.findOne({ email })

        if (user) {
            throw new Error('Email is already registered to an user')
        }

        // encrypt password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const { insertedId } = await users.insertOne({ email, password: hashedPassword })

        const token = signToken(insertedId.toString(), email)
        res.status(201).send({ message: 'Signup successful', token })
    }
    catch (e: any) {
        res.status(400).send({ message: e.message })
    }
    finally {
        client.close()
    }
}