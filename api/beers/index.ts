import { VercelResponse } from '@vercel/node'
import getClient from '../../mongodb'
import auth from '../../auth'

import { Request } from '../../types'

export default async function (req: Request, res: VercelResponse) {
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
        catch (e: any) {
            res.status(401).send({ message: e.message })
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

            res.status(201).send('ok')
        }
        catch (e: any) {
            res.status(401).send({ message: e.message })
        }
        finally {
            client.close()
        }
    }
}
