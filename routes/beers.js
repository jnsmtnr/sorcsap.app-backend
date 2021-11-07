import { ObjectId } from 'bson'
import { Router } from 'express'
import { auth, isAdmin } from '../middleware/auth.js'
import getClient from '../mongodb.js'

const router = Router()

router.get('/', auth, async function (req, res) {
    const client = getClient()

    try {
        await client.connect()

        const beers = client.db().collection('beers')

        const allBeers = await beers.find().toArray()

        res.send(allBeers);
    }
    catch (error) {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.post('/', auth, isAdmin, async function (req, res) {
    const client = getClient()

    const { name, brewery, alc, type } = req.body

    try {
        await client.connect()

        const beers = client.db().collection('beers')

        await beers.insertOne({ name, brewery, alc, type })

        res.sendStatus(201)
    }
    catch (error) {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.delete('/:id', auth, isAdmin, async function (req, res) {
    const client = getClient()

    const { id } = req.params

    try {
        await client.connect()

        const beers = client.db().collection('beers')

        await beers.deleteOne({ _id: ObjectId(id) })

        res.sendStatus(201)
    }
    catch {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.patch('/:id', auth, isAdmin, async function (req, res) {
    const client = getClient()

    const { id } = req.params
    const { name, brewery, type, alc } = req.body

    const setObject = {}

    if (name) {
        setObject.name = name
    }
    if (brewery) {
        setObject.brewery = brewery
    }
    if (type) {
        setObject.type = type
    }
    if (alc) {
        setObject.alc = alc
    }

    try {
        await client.connect()

        const beers = client.db().collection('beers')

        await beers.updateOne({ _id: ObjectId(id) }, { $set: setObject })

        res.sendStatus(201)
    }
    catch {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close
    }
})

export default router
