import { Router } from 'express'
import { ObjectId } from 'mongodb'
import getClient from '../mongodb.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { auth, isAdmin } from '../middleware/auth.js'

const privateKey = process.env.JWT_PRIVATE_KEY

function signToken(id, email, isAdmin = false) {
    const payload = { id, email }
    if (isAdmin) {
        payload.admin = true
    }
    return jwt.sign(payload, privateKey, { expiresIn: '7d' })
}

const router = Router()

router.post('/signup', async function (req, res) {
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
    catch (error) {
        res.status(400).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.post('/login', async function (req, res) {
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
})

router.get('/', auth, isAdmin, async function (req, res) {
    const client = getClient()

    try {
        await client.connect()

        const users = client.db().collection('users')

        const allUsers = await users.find().project({ password: 0 }).toArray()

        res.send(allUsers)
    }
    catch (error) {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.patch('/:id', auth, isAdmin, async function (req, res) {
    const client = getClient()

    try {
        await client.connect()

        const users = client.db().collection('users')

        const setObject = {}
        const unsetObject = {}

        if (req.body.email) {
            setObject.email = req.body.email
        }

        if (req.body.password) {
            setObject.password = await bcrypt.hash(req.body.password, 10)
        }

        if (req.body.admin) {
            setObject.admin = true
        }

        if (req.body.admin === false) {
            unsetObject.admin = ''
        }

        await users.updateOne({ _id: new ObjectId(req.params.id) }, { $set: setObject, $unset: unsetObject })

        res.sendStatus(201)
    }
    catch (error) {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.delete('/:id', auth, isAdmin, async function(req, res) {
    const client = getClient()

    try {
        await client.connect()

        const ratings = client.db().collection('ratings')

        await ratings.deleteMany({ userId: new ObjectId(req.params.id) })

        const users = client.db().collection('users')

        await users.deleteOne({ _id: new ObjectId(req.params.id) })

        res.sendStatus(201)
    }
    catch (error) {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

export default router
