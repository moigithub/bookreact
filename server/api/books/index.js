'use strict';
var Books = require('./books_model');
var BookAPI = require('./bookAPI');
/////////////////////


// check if place exist, update: check if user exist add/remove user
// else create a new one

function addBook(req, res) {
    console.log("addBook api", req.body)
    var bookName = req.body.book;
    if (!bookName) {
        return handleError(res, "Missing book name.")
    }

    //console.log("book name",bookName, "token decoded", req.decoded);


    Books.findOne({
        name: bookName
    }, function(err, book) {
        if (err) {
            return handleError(res, err);
        }

        if (!book) {
            // none added yet, im the first going

            BookAPI(bookName, function(qerr, bookData) {
                if (qerr) {
                    return handleError(res, qerr);
                }

                //bookData= JSON.parse(bookData);

                var data = {
                    owner: req.body.userId,
                    image: bookData.items[0].volumeInfo.imageLinks ? bookData.items[0].volumeInfo.imageLinks.thumbnail : "",
                    isbn: bookData.items[0].volumeInfo.industryIdentifiers[0].identifier || "",
                    name: bookData.items[0].volumeInfo.title || "",
                    tradeRequest: []
                };
                console.log(data, "***");

                Books.create(data, function(serr, book) {
                    if (serr) {
                        return handleError(res, serr);
                    }
                    //console.log("created data");
                    return res.status(200).json(book);

                });

            }); //bookAPI

        }
        else {
            //already exist
            //return error
            //return res.status(200).json(book);

            //409 Conflict
            return res.status(409).send("Error: book already exist");


        }
    }); //findone


} //addBook


function delBook(req, res) {
    var bookId = req.params.book;
    if (!bookId) {
        return handleError(res, "Missing book info.")
    }

    //console.log("delete",book);

    Books.findById(bookId, function(err, book) {
        if (err) {
            return handleError(res, err);
        }
        if (!book) {
            return res.status(404).send('Not Found');
        }

        book.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(204).send('No Content');
        });
    });

} //delete book

function getBook(req, res) {
    // populate with user data 
    // tradeRequest contains userId--- should populate with user fullname or email
    //lean() removes all mongoose data, leaving only JSON object
    Books.find({}).populate('tradeRequest.user', '_id email fullName').lean().exec(function(err, books) {
        if (err) {
            return handleError(res, err);
        }
        //console.log("all books",books);
        return res.status(200).json(books);

    });
}

function updateBook(req, res) {
    console.log("updatebook req.body", req.body);
    if (req.body._id) {
        delete req.body._id;
    }
    Books.findById(req.params.bookid, function(err, book) {
        if (err) {
            return handleError(res, err);
        }
        if (!book) {
            return res.status(404).send('Not Found');
        }

        var userId = req.body.user;
        var action = req.body.action;
console.log("action",action, "userid", userId);
        if (action === "toggle") {
            var inList = book.tradeRequest.filter(u => u.user == userId).length > 0;
            console.log("inList",inList);
            if (inList) {
                book.tradeRequest = book.tradeRequest.filter(u => u.user != userId);
            }
            else {
                book.tradeRequest.push({ user: userId });
            }
        }
        else if (action === "newOwner") {
            book.tradeRequest = [];
            book.owner = userId;
        }
        else if (action === "decline") {
            if (userId === "*") {
                book.tradeRequest = [];
            }
            else {
                book.tradeRequest = book.tradeRequest.filter(u => u.user != userId);
            }
        }

        //var updated = Object.assign(book, req.body);
        console.log("updated", book);
        book.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            //lean remove extra mongo objects n functions, return plain json data
            Books.findById(book._id).populate('tradeRequest.user', '_id email fullName').lean().exec(function(err, doc) {
                if (err) {
                    return handleError(res, err);
                }
                return res.status(200).json(doc);
            });
        });
    });
}

function handleError(res, err) {
    console.log("error", err);
    return res.status(500).send(err);
}




const midwares = require('../../midwares');


var express = require('express');
var router = express.Router();

router.get('/', getBook);
router.post('/', midwares.isLoggedIn, midwares.checkToken, addBook);
router.put('/:bookid', midwares.isLoggedIn, midwares.checkToken, updateBook);
router.delete('/:book', midwares.isLoggedIn, midwares.checkToken, delBook);

module.exports = router;