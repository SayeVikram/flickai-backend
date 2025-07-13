const mongoose = require("mongoose")


const productSchema = mongoose.Schema(
    {
        original_language: String,
        title: String, 
        overview: String, 
        release_date: String,
        genre_ids: [String],
        popularity: {
            type: String,
            required: false
        },
        image: {
            type: String,
            required: false
        },
        overview_embedding: [Number]
    }
);

const Product = mongoose.model("Product", productSchema)

module.exports=Product