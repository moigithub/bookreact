'use strict';
var Books = require('./books_model');
var BookAPI = require('./bookAPI');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
/////////////////////


// check if place exist, update: check if user exist add/remove user
// else create a new one

function addBook(req, res){
console.log("addBook api",req.body)
  var bookName=req.body.book;
  if(!bookName) {return handleError(res, "Missing book name.")}
  
//console.log("book name",bookName, "token decoded", req.decoded);


  Books.findOne({name: bookName}, function(err, book){
      if(err){ return handleError(res,err);}
      
      if(!book ){ 
        // none added yet, im the first going

        BookAPI(bookName,  function(qerr, bookData){
          if(qerr){ return handleError(res,qerr);}
          
          //bookData= JSON.parse(bookData);

          var data = {
            owner: req.body.userId,
            image: bookData.items[0].volumeInfo.imageLinks?bookData.items[0].volumeInfo.imageLinks.thumbnail: "", 
            isbn: bookData.items[0].volumeInfo.industryIdentifiers[0].identifier || "",
            name: bookData.items[0].volumeInfo.title || "",
            tradeRequest : []
          };
          console.log(data,"***");
          
          Books.create(data,function(serr, book){
              if(serr){return handleError(res,serr);}
              //console.log("created data");
              return res.status(200).json(book);
              
          });
          
        });//bookAPI

      } else {
        //already exist
        //return error
        //return res.status(200).json(book);
        
        //409 Conflict
        return  res.status(409).send("Error: book already exist");
        
        
      }
  }); //findone


}//addBook


function delBook(req, res){
  var bookId=req.params.book;
  if(!bookId) {return handleError(res, "Missing book info.")}
  
//console.log("delete",book);

  Books.findById( bookId, function(err, book){
    if(err){ return handleError(res,err);}
    if(!book) { return res.status(404).send('Not Found'); }
    
    book.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });

}//delete book

function getBook(req, res){
  Books.find({},function(err,books){
    if(err){ return handleError(res,err);}
    //console.log("all books",books);
    return res.status(200).json(books);
    
  });
}

function updateBook(req, res){
  if(req.body._id) { delete req.body._id; }
  Books.findById(req.params.bookid, function (err, book) {
    if (err) { return handleError(res, err); }
    if(!book) { return res.status(404).send('Not Found'); }
    
    book.tradeRequest = req.body.tradeRequest || [];
    book.owner = req.body.owner;
    console.log("updatebook req.body",req.body);
    
    //var updated = Object.assign(book, req.body);
    console.log("updated",book);
    book.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(book);
    });
  });  
}

function handleError(res, err) {
  console.log("error",err);
  return res.status(500).send(err);
}




// check JWT middleware
// it will afffect all below THIS line routes
function checkToken(req, res, next) {
  var token = req.headers['authorization'];
  console.log("headers",req.headers);
  if(token){
    console.log("no token");
    jwt.verify(token, 'sekretJWT', function(err, decoded){
      if(err) return res.json({message:'auth failed.'})
      
      req.decoded = decoded;
      return next();
    })
  } else {
    return res.status(403).send({message:'Access not allowed.'});
  }
};

//check if is logged middleware
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}


var express = require('express');
var router = express.Router();

router.get('/', getBook);
router.post('/', isLoggedIn, checkToken, addBook);
router.put('/:bookid', isLoggedIn, checkToken, updateBook);
router.delete('/:book', isLoggedIn, checkToken, delBook);

module.exports = router;