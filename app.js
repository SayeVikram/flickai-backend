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




async function connectMon(client){
    await client.connect()
}

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



app.post('/query-embedding', async (req, res) => {

  try {
    const { query } = req.body

    // Debug: Check if collection has documents
    const totalDocs = await coll.countDocuments()
    console.log('Total documents in collection:', totalDocs)
    
    // Debug: Get a sample document to see structure
    const sampleDoc = await coll.findOne()
    console.log('Sample document structure:', JSON.stringify(sampleDoc, null, 2))

    const embedding = await createEmbedding(query)
    console.log('Query embedding length:', embedding.length)

    async function findSimilarDocuments(embedding) {
      try {
        
        // Try the updated vector search syntax first
        const documents = await coll
          .aggregate([
            {
              $vectorSearch: {
                queryVector: embedding,
                path: 'overview_embedding',
                numCandidates: 100,
                limit: 2
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
        
        // Fallback to knnBeta if vectorSearch fails
        try {
          console.log('Trying knnBeta fallback...')
          const documents = await coll
            .aggregate([
              {
                $search: {
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
    // Check document count
    const totalDocs = await coll.countDocuments()
    
    // Get sample documents
    const sampleDocs = await coll.find().limit(3).toArray()
    
    // Check indexes
    const indexes = await coll.listIndexes().toArray()
    
    // Check search indexes (if available)
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