var Books = require('./api/books/books_model');
/*
 owner: {type: Schema.ObjedId}, // user input.. chicago, san francisco, texas
    image: String,  // which bar from barlist
    isbn: String,
    name: String,
    tradeRequest: Array 
*/
Books.find({}).remove(function() {
  Books.create({
    owner:'1',
    image: "http://books.google.com/books/content?id=qy8BCwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    isbn: "9781612127385",
    name: "Chai",
    tradeRequest: []
  }, {
    owner:'1',
    image: "http://books.google.com/books/content?id=t41tAqDHNKcC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    isbn: "9781442644038",
    name: "Flux",
    tradeRequest: ["3","4","5"]
  }, {
    owner:'2',
    image: "http://books.google.com/books/content?id=_uTRAwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    isbn: "9781118871652",
    name: "JavaScript and JQuery",
    tradeRequest: ["1","4","5"]
  }, {
    owner:'2',
    image:"http://books.google.com/books/content?id=NZCKCgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    isbn:"9781484212455",
    name:"Introduction to React",
    tradeRequest: ["1"]
  }, function() {
      console.log('finished populating');
    }
  );
});