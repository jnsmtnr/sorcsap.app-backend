const { MongoClient } = require('mongodb')

const password = process.env.MONGO_PASSWORD

const uri = `mongodb+srv://admin:${password}@cluster0.jwoag.mongodb.net/test?retryWrites=true&w=majority`

function getClient() {
    return new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
}

module.exports = getClient