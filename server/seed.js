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
    image: '',
    isbn: '123456',
    name: 'test',
    tradeRequest: []
  }, {
    owner:'1',
    image: '',
    isbn: '234567',
    name: 'otro book',
    tradeRequest: []
  }, {
    owner:'2',
    image: '',
    isbn: '747657',
    name: 'javascript',
    tradeRequest: []
  }, {
    owner:'2',
    image: '',
    isbn: '145356',
    name: 'React and redux',
    tradeRequest: []
  }, function() {
      console.log('finished populating');
    }
  );
});