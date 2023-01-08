import express, { application } from "express"
import { db, connectToDb } from "./db.js"

const app = express()
app.use(express.json())


//This is sample data created before database comes into the picture
// const articles = [{
//     name: 'learn-react',
//     upvotes: 0,
//     comments: []
// }, {
//     name: 'learn-node',
//     upvotes: 0,
//     comments: []
// }, {
//     name: 'mongodb',
//     upvotes: 0,
//     comments: []
// }]

// app.post('/hello', (req, res) => {
//     console.log(req.body)
//     res.send('Hello!')
// });

// app.get('/hello/:name', (req, res) => {
//     const { name } = req.params
//     res.send(`Hello ${name}!!`)
// })

app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params

    const article = await db.collection('articles').findOne({ name })
    
    if(article) {
        res.json(article)
    } else {
        res.sendStatus(404)
    }
})

app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params

    await db.collection('articles').updateOne({ name }, {
        $inc: { upvotes: 1 }
    })

    const article = await db.collection('articles').findOne({ name })
    if(article) {
        res.send(`The article ${name} has ${article.upvotes} upvotes`)
    } else {
        res.send('The article does not exist')
    }
}) 

app.post('/api/articles/:name/postComment', async (req, res) => {
    const { name } = req.params
    const { postedBy, text } = req.body

    await db.collection('articles').updateOne({ name }, {
        $push: { comments: { postedBy, text }}
    })

    const article = await db.collection('articles').findOne({ name })

    if(article) {
        res.send(article.comments);
    } else {
        res.send('The article does not exist')
    }
})

app.get('/api/articles/:name/upvoteCount', (req, res) => {
    const { name } = req.params
    const article = findArticle(name)
    if(article) {
        res.send(`The article ${name} has ${article.upvotes} upvotes`)
    } else {
        res.send('The article does not exist')
    }
})

function findArticle(name) {
    return articles.find(arc => arc.name === name)
}


connectToDb(() => {
    console.log('Database successfully connected!')
    app.listen(8000, () => {
        console.log('Server is listening on port 8000')
    });
})