const { MongoClient } = require("mongodb")

const client = new MongoClient("mongodb+srv://sayevikramkarthikeyan:ZMiRFyzgBFRAVicj@cluster0.zoroxv2.mongodb.net/FlicksAI?retryWrites=true&w=majority&appName=Cluster0")
const coll = client.db("FlicksAI").collection("products")

async function listMongoCollections() {
        const uri = "mongodb+srv://sayevikramkarthikeyan:ZMiRFyzgBFRAVicj@cluster0.zoroxv2.mongodb.net/FlicksAI?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db("FlicksAI"); // Replace with your database name
            return database
        } catch(error) {
            console.log(error)
            return error
        }
    }

  db =  listMongoCollections();
  module.exports = db;
