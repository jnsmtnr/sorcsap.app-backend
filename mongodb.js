import { MongoClient } from 'mongodb'

const password = process.env.MONGO_PASSWORD
const database = process.env.MONGO_DATABASE

const uri = `mongodb+srv://admin:${password}@cluster0.jwoag.mongodb.net/${database}?retryWrites=true&w=majority`

export default function getClient() {
    return new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
}
