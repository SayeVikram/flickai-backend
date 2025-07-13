const dotenv = require("dotenv");
const { OpenAI } = require("openai");

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.API_KEY, 
});

const createEmbedding = async (text) => {

  const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: text,
          dimensions: 768
        });

  const data = embeddingResponse["data"]
  const obj = data[0]
  const embedding = obj["embedding"]

  console.log(embedding)

  return embedding
}

module.exports = { createEmbedding }
