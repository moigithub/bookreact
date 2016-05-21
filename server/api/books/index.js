'use strict';
var Books = require('./books_model');
var BookAPI = require('./bookAPI');
/////////////////////


// check if place exist, update: check if user exist add/remove user
// else create a new one

function addBook(req, res){
  
  var bookName=req.body.book;
  if(!bookName) {return handleError(res, "Missing book name.")}
  
console.log("book name",bookName);


  Books.findOne({name: bookName}, function(err, book){
      if(err){ return handleError(res,err);}
      
      if(!book ){ 
        // none added yet, im the first going

        BookAPI(bookName,  function(qerr, bookData){
          if(qerr){ return handleError(res,qerr);}
          
          //bookData= JSON.parse(bookData);

          var data = {
            owner:'1',   //req.body.userId
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
  return res.status(200).json({ok:true});
}

function handleError(res, err) {
  console.log("error",err);
  return res.status(500).send(err);
}





var express = require('express');
var router = express.Router();

router.get('/', getBook);
router.post('/', addBook);
router.put('/:book/:userId', updateBook);
router.delete('/:book', delBook);

module.exports = router;