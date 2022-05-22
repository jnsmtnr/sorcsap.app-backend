import getClient from '../../mongodb.js'
import auth from '../../auth.js'

export default async function (req, res) {
    if (req.method === 'OPTIONS') return res.status(200).json({ body: "OK" })

    if (req.method !== 'GET' && req.method !== 'POST') return res.status(404).send('not found')

    if (req.method === 'GET') {
        if (!auth(req)) return res.status(401).send('auth error')

        const client = getClient()

        try {
            await client.connect()

            const beers = client.db().collection('beers')

            const allBeers = await beers.find().toArray()

            res.send(allBeers)
        }
        catch (error) {
            res.status(401).send({ message: error.message })
        }
        finally {
            client.close()
        }
    }

    if (req.method === 'POST') {
        if (!auth(req) || !req.user.admin) return res.status(401).send('auth error')

        const client = getClient()

        const { name, brewery, alc, type } = req.body

        try {
            await client.connect()

            const beers = client.db().collection('beers')

            await beers.insertOne({ name, brewery, alc, type })

            res.status(201).send()
        }
        catch (error) {
            res.status(401).send({ message: error.message })
        }
        finally {
            client.close()
        }
    }
}
