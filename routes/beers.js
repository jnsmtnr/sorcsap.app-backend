import { Router } from 'express'
import { auth } from '../middleware/auth.js'
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

export default router
