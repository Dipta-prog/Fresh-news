const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

const port = process.env.PORT || 5092;

app.use(cors());
app.use(bodyParser.json());

// console.log(process.env.DB_USER,process.env.DB_PASS)
app.get('/', (req, res) => {
    res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stltu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('connection error', err)
    const allNewsCollection = client.db("Fresh-News").collection("All-News-List");
    const topNews = client.db("Fresh-News").collection("Top-News");
    const newsHighlight = client.db("Fresh-News").collection("News-Highlights");
    const adminsCollection = client.db("Fresh-News").collection("Make-Admin");


    // all
    app.get('/newsList', (req, res) => {
        allNewsCollection.find({})
            .toArray((err, items) => {
                res.send(items);
            })
    });

    // Top News
    app.get('/topNewsList', (req, res) => {
        topNews.find({})
            .toArray((err, items) => {
                res.send(items);
            })
    });

    // News Highlight
    app.get('/newsHighlight', (req, res) => {
        newsHighlight.find({})
            .toArray((err, items) => {
                res.send(items);
            })
    });

    // view by category
    app.get('/newsList/:category', (req, res) => {
        console.log('from req.params', req.params.category)
        if (req.params.category === 'All' || req.params.category === undefined || req.params.category === null || req.params.category === '') {
            allNewsCollection.find({})
                .toArray((err, items) => {
                    res.send(items);
                })
        }
        else {
            allNewsCollection.find({ category: req.params.category })
                .toArray((err, items) => {
                    res.send(items);
                    console.log(err);
                })
        }
    });
    // view by id
    app.get('/view-more/:id', (req, res) => {
        console.log('from req.params', req.params.id)
        allNewsCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, items) => {
                res.send(items[0]);
                console.log(err);
            })
    });

    // add news
    app.post('/addNews', (req, res) => {
        const newProduct = req.body;
        console.log('adding new product', newProduct);
        allNewsCollection.insertOne(newProduct)
            .then(result => {
                console.log('inserted count', result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })

    // delete news
    app.delete('/deleteNews/:id', (req, res) => {
        console.log('from deleteProduct backend', req.params.id)
        allNewsCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send({ deleteCount: result.deletedCount });
            })
    });


    // verify-admin
    app.post('/isAdmin', (req, res) => {
        // console.log(req.query.email);
        adminsCollection.find({ email: req.body.email })
            .toArray((err, admins) => {
                console.log('find result by email', admins);
                res.send(admins.length > 0);
            })
    });


    // make-admin
    app.post('/addAdmins', (req, res) => {
        const newAdminEmail = req.body;
        console.log('adding review', newAdminEmail);
        adminsCollection.insertOne(newAdminEmail)
            .then(result => {
                console.log('inserted count', result);
                res.send(result.insertedCount > 0)
            })
    });


    //   client.close();
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})