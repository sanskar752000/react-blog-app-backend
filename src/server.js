import fs from 'fs'
import admin from 'firebase-admin'
import express, { application } from "express"
import { db, connectToDb } from "./db.js"

const credentials = JSON.parse(
    fs.readFileSync('./credentials.json')
)
admin.initializeApp({
    credential: admin.credential.cert(credentials),
})

const app = express()
app.use(express.json())

//this middleware get the authtoken if present
// means the user is logged in
app.use( async (req, res, next) => {
    const { authtoken } = req.headers
    if(authtoken) {
        try {
            req.user = await admin.auth().verifyIdToken(authtoken)
        } catch(e) {
            return res.sendStatus(400);
        }
    }

    req.user = req.user || {};
    // this below callback function specifies that this middleware process is completed
    next();
})

app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params
    const { uid } = req.user

    const article = await db.collection('articles').findOne({ name })
    
    if(article) {
        const upvoteIds = article.upvoteIds || []
        article.canUpvote = uid && !upvoteIds.includes(uid);
        // console.log(article);
        res.json(article)
    } else {
        res.sendStatus(404)
    }
})

// This middleware specifies that 
// if user is logged in then give access further else it's unauthorized
app.use((req, res, next) => {
    if(req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
})

app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params
    const { uid } = req.user
    const article = await db.collection('articles').findOne({ name })
    
    if(article) {
        const upvoteIds = article.upvoteIds || []
        const canUpvote = uid && !upvoteIds.includes(uid);

        if(canUpvote) {
            await db.collection('articles').updateOne({ name }, {
                $inc: { upvotes: 1 },
                $push: { upvoteIds: uid }
            })
        }
        const updatedArticle = await db.collection('articles').findOne({ name })
        res.send(updatedArticle)
    } else {
        res.send('The article does not exist')
    }
}) 

app.post('/api/articles/:name/postComment', async (req, res) => {
    const { name } = req.params
    const { text } = req.body
    const { email } = req.user

    await db.collection('articles').updateOne({ name }, {
        $push: { comments: { postedBy: email, text }}
    })

    const article = await db.collection('articles').findOne({ name })

    if(article) {
        res.json(article);
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