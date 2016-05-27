var Books = require('./api/books/books_model');
var mongoose = require('mongoose');

/*
 owner: {type: Schema.ObjedId}, // user input.. chicago, san francisco, texas
    image: String,  // which bar from barlist
    isbn: String,
    name: String,
    tradeRequest: Array 
*/
Books.find({}).remove(function() {
  Books.create({
    owner:mongoose.Types.ObjectId('5745b8356201c8c1084a417d'),
    image: "http://books.google.com/books/content?id=qy8BCwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    isbn: "9781612127385",
    name: "Chai",
    tradeRequest: [{user:mongoose.Types.ObjectId("5744ce9764cd980a0dc26081")},{user:mongoose.Types.ObjectId("5746280dbd2dc8a7157e0f17")}]
  }, {
    owner:mongoose.Types.ObjectId('5745b8356201c8c1084a417d'),
    image: "http://books.google.com/books/content?id=t41tAqDHNKcC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    isbn: "9781442644038",
    name: "Flux",
    tradeRequest: [{user:mongoose.Types.ObjectId("5744d1c8e5ab4a4a0de97246")},{user:mongoose.Types.ObjectId("5746280dbd2dc8a7157e0f17")}]
  }, {
    owner:mongoose.Types.ObjectId('5744ce9764cd980a0dc26081'),
    image: "http://books.google.com/books/content?id=_uTRAwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    isbn: "9781118871652",
    name: "JavaScript and JQuery",
    tradeRequest: [{user:mongoose.Types.ObjectId("5745b8356201c8c1084a417d")},{user:mongoose.Types.ObjectId("5746280dbd2dc8a7157e0f17")},{user:mongoose.Types.ObjectId("5744d1c8e5ab4a4a0de97246")}]
  }, {
    owner:mongoose.Types.ObjectId('5744ce9764cd980a0dc26081'),
    image:"http://books.google.com/books/content?id=NZCKCgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    isbn:"9781484212455",
    name:"Introduction to React",
    tradeRequest: [{user:mongoose.Types.ObjectId("5745b8356201c8c1084a417d")}]
  }, function() {
      console.log('finished populating');
    }
  );
});