import { VercelResponse } from '@vercel/node'
import { ObjectId } from 'mongodb'

import getClient from '../../mongodb'
import auth from '../../auth'

import { Request } from '../../types'

export default async function (req: Request, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).json({ body: "OK" })

    if (req.method !== 'DELETE' && req.method !== 'PATCH') return res.status(404).send('not found')

    if (req.method === 'DELETE') {
        if (!auth(req) || !req.user.admin) return res.status(401).send('auth error')

        const client = getClient()

        const { id } = req.query

        try {
            await client.connect()

            const beers = client.db().collection('beers')

            await beers.deleteOne({ _id: new ObjectId(id as string) })

            res.status(201).send('ok')
        }
        catch (e: any) {
            res.status(401).send({ message: e.message })
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

        const setObject: { name?: string, brewery?: string, type?: string, alc?: number } = {}

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

            await beers.updateOne({ _id: new ObjectId(id as string) }, { $set: setObject })

            res.status(201).send('ok')
        }
        catch(e: any) {
            res.status(401).send({ message: e.message })
        }
        finally {
            client.close
        }
    }
}
