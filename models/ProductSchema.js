const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    Image:String,
    category: String

});

const Product = mongoose.model('Product',productSchema);

module.exports = Product;