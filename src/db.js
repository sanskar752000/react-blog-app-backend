import { MongoClient } from "mongodb"
let db

async function connectToDb(callback) {
    const client = new MongoClient(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.0afvjwn.mongodb.net/?retryWrites=true&w=majority`)
    await client.connect()
    db = (await client).db('react-blog-db')
    callback()
}

export {
    db,
    connectToDb
}