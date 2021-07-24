const router = require('express').Router()
const getClient = require('../mongodb.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const privateKey = process.env.JWT_PRIVATE_KEY

router.post('/signup', async function(req, res) {
    const client = getClient()

    try {
        // validate email
        if (!(req.body && req.body.email && req.body.email.includes('@') && req.body.email.includes('.'))) {
            throw new Error('Invalid e-mail address')
        }

        // validate password
        if (!(req.body && req.body.password && req.body.password.length >= 8)) {
            throw new Error('Password must be at least 8 characters long')
        }

        await client.connect()

        const users = client.db().collection('users')

        const user = await users.findOne({ email: req.body.email })

        if (user) {
            throw new Error('Email is already registered to an user')
        }

        // encrypt password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        await users.insertOne({ email: req.body.email, password: hashedPassword })

        res.status(201).send({ message: 'Signup successful' })
    }
    catch (error) {
        res.status(400).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.post('/login', async function(req, res) {
    const client = getClient()

    try {
        if (
            !(req.body && req.body.email && req.body.email.includes('@') && req.body.email.includes('.'))
            || !(req.body && req.body.password && req.body.password.length >= 8)
        ) {
            throw new Error('Invalid e-mail address or password')
        }

        await client.connect()

        const users = client.db().collection('users')

        const user = await users.findOne({ email: req.body.email })

        if (!user) {
            throw new Error('Invalid e-mail address or password')
        }

        if (await bcrypt.compare(req.body.password, user.password)) {
            const token = jwt.sign({ email: user.email }, privateKey, { expiresIn: '1h' })
            res.status(200).send({ message: 'Password is correct', token })
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

module.exports = router