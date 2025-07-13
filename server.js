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

    const embedding = await createEmbedding(query)

    async function findSimilarDocuments(embedding) {
      try {
        
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
          

        return documents
      } catch (err) {
        console.error(err)
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





app.listen(3000, () => {console.log("Started server")})





