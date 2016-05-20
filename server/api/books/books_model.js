'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
    owner: String,//{type: Schema.ObjectId}, // user input.. chicago, san francisco, texas
    image: String,  // which bar from barlist
    isbn: String,
    name: String,
    tradeRequest: Array  // of userIds
});

module.exports = mongoose.model('Books', BookSchema);

