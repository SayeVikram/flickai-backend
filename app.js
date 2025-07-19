const express = require("express")
const app = express()
const mongoose = require("mongoose")
const Product = require("./models/product.model.js")
var bodyParser = require('body-parser');
const { createEmbedding } = require('./createEmbedding.js')
const { MongoClient } = require("mongodb")



app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json())

const uri = "mongodb+srv://sayevikramkarthikeyan:ZMiRFyzgBFRAVicj@cluster0.zoroxv2.mongodb.net/FlicksAI?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
client.connect()
const coll = client.db("FlicksAI").collection("products");


app.get("/", (req, res) => {
    console.log("Got info")
    res.status(200).json("Got info")
})

app.post("/api/movies", async (req, res) => {
    try{
        const movies = await Product.insertMany(req.body)
        res.status(200).json(movies)
        
    }
    catch(error){
        res.status(500).json({errorMessage: error.message})
    }
})


app.get('/sample-one', async (req, res) => {
  try{
    const doc = await coll.findOne()
    res.status(200).json(doc)
    console.log("Successfully sent a movie down")
  }
  catch(error){
    console.log(error)
    res.status(500).json(error)
  }
})


app.post('/query-embedding', async (req, res) => {

  try {
    const { query } = req.body

    const totalDocs = await coll.countDocuments()
    console.log('Total documents in collection:', totalDocs)
    
    const sampleDoc = await coll.findOne()
    console.log('Sample document structure:', JSON.stringify(sampleDoc, null, 2))

    const embedding = await createEmbedding(query)
    console.log('Query embedding length:', embedding.length)

    async function findSimilarDocuments(embedding) {
      try {
        
        const documents = await coll
          .aggregate([
            {
              $vectorSearch: {
                queryVector: embedding,
                path: 'overview_embedding',
                index: 'dot_product_search',
                numCandidates: 100,
                limit: 5
              }
            },
            {
              $project: {
                overview: 1,
                score: { $meta: "vectorSearchScore" }
              }
            }
          ])
          .toArray()

        return documents
      } catch (err) {
        console.error('Vector search error:', err)
        

        try {
          console.log('Trying knnBeta fallback...')
          const documents = await coll
            .aggregate([
              {
                $search: {
                  index: 'knn_search',
                  knnBeta: {
                    vector: embedding,
                    path: 'overview_embedding',
                    k: 2
                  }
                }
              },
              {
                $project: {
                  overview: 1
                }
              }
            ])
            .toArray()
          return documents
        } catch (fallbackErr) {
          console.error('Fallback knnBeta error:', fallbackErr)
          throw fallbackErr
        }
      }
    }

    const similarDocuments = await findSimilarDocuments(embedding)

    console.log('similarDocuments: ', similarDocuments)


    res.status(200).json(similarDocuments)

  } catch (err) {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    })
  }
})

app.get("/debug/collection", async (req, res) => {
  try {

    const totalDocs = await coll.countDocuments()
    

    const sampleDocs = await coll.find().limit(3).toArray()
    

    const indexes = await coll.listIndexes().toArray()
    
    let searchIndexes = []
    try {
      searchIndexes = await coll.listSearchIndexes().toArray()
    } catch (err) {
      console.log('Search indexes not available:', err.message)
    }
    
    res.status(200).json({
      totalDocuments: totalDocs,
      sampleDocuments: sampleDocs,
      indexes: indexes,
      searchIndexes: searchIndexes
    })
  } catch (err) {
    res.status(500).json({
      error: 'Debug error',
      message: err.message
    })
  }
})




app.listen(3000, () => {console.log("Started server")})