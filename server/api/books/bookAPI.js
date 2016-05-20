'use strict';
var request = require('request');

var API = "https://www.googleapis.com/books/v1/volumes?q=";

module.exports = function(search, callback){
    var SEARCH = API+encodeURIComponent(search);
    console.log(SEARCH);
    request(SEARCH, function (error, response, body) {
        if (!error && response.statusCode == 200) {
           var info = JSON.parse(body);
            return callback(null, info);
        }
        if(error) return callback(error);
    });
}