import { MongoClient } from "mongodb"
let db

async function connectToDb(callback) {
    const client = new MongoClient('mongodb://127.0.0.1:27017')
    await client.connect()
    db = (await client).db('react-blog-db')
    callback()
}

export {
    db,
    connectToDb
}