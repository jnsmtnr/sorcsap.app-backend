import { ObjectId } from 'mongodb'

import getClient from '../../mongodb.js'
import auth from '../../auth.js'

export default async function (req, res) {
    if (req.method === 'OPTIONS') return res.status(200).json({ body: "OK" })

    if (req.method !== 'DELETE' && req.method !== 'PATCH') return res.status(404).send('not found')

    if (req.method === 'DELETE') {
        if (!auth(req) || !req.user.admin) return res.status(401).send('auth error')

        const client = getClient()

        const { id } = req.query

        try {
            await client.connect()

            const beers = client.db().collection('beers')

            await beers.deleteOne({ _id: new ObjectId(id) })

            res.status(201).send()
        }
        catch {
            res.status(401).send({ message: error.message })
        }
        finally {
            client.close()
        }
    }

    if (req.method === 'PATCH') {
        if (!auth(req) || !req.user.admin) return res.status(401).send('auth error')

        const client = getClient()

        const { id } = req.query
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

            await beers.updateOne({ _id: new ObjectId(id) }, { $set: setObject })

            res.status(201).send()
        }
        catch {
            res.status(401).send({ message: error.message })
        }
        finally {
            client.close
        }
    }
}
