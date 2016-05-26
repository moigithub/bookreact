'use strict';

require('babel-register')({
    presets: ['es2015']  //, 'react'
})

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var http = require('http');
var path = require('path');
var express = require('express');
var morgan = require('morgan')
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var mongoose = require('mongoose');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//var TwitterStrategy = require("passport-twitter").Strategy;
var flash = require('connect-flash');
//var ejs = require('ejs');

var app = express();


var isDeveloping = process.env.NODE_ENV !== 'production';
//console.log("env",process.env.NODE_ENV, isDeveloping);

if(isDeveloping){
  require('dotenv').config();

  var webpack = require('webpack');
  var webpackConfig =require('../webpack.config.js');
  //import webpack from 'webpack';  
  var webpackMiddleware =require('webpack-dev-middleware');
  var webpackHotMiddleware = require('webpack-hot-middleware');
  var compiler = webpack(webpackConfig);
  
  
  
  app.use(webpackMiddleware(compiler, {
    lazy: false,
    noInfo: true,
    quiet: false,
    errorDetails: true,
//      noInfo: true, 
      publicPath: webpackConfig.output.publicPath,
      stats: {
        colors: true,
      },
      hot: true,
  }));
  app.use(webpackHotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000,
  }));
  
  // populate DB
  require('./seed');
}// end isDeveloping



var config={
  mongo:{
    options:{
      db:{safe:true}
    },
    uri : process.env.MONGO_URI || 'mongodb://localhost/bookreact'
  },
  secret:'supers3cretpassw0rd.dont.tell,any1'
};

/// connect to db
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err){
  console.error("error connecting to the DB "+ err);
  process.exit(-1);
});

/////////////////
var viewpath = path.resolve(path.join(__dirname,".."), 'client/views');
//console.log("viewpath",viewpath);
app.set('views', viewpath);
app.set('view engine', 'ejs');
//app.set('view engine', 'html');

// middlewares

app.use(flash());
app.use(express.static(path.resolve(path.join(__dirname,".."), 'public'))); // this above session/cookie middlewares prevent create for static files
app.use(favicon(__dirname+'/../public/favicon.ico'));



app.use(session({
  secret: config.secret,
  resave: true,
  saveUninitialized: true,
  store: new mongoStore({mongooseConnection: mongoose.connection, db: 'nightreact'})
}));



//form process
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(methodOverride());

// request logger
app.use(morgan('dev'));

/////////////////////////////////////////////////// user model
var User = require('./api/users/user_model');
/// passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
      
      /// create JWT token
      var n = jwt.sign(user, 'sekretJWT', {expiresIn: '1h'});  // expires in 24 hours
      var userData = {
        email: user.email,
        password: user.password,
        _id: user._id,
        token: n
      };
      
      //console.log("---------------------------////////////",userData);    
    done(err, userData);
  });
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done){
  //async
  // User.findOne wont fire unless data is sent back
  process.nextTick(function(){
    User.findOne({'email': email}, function(err, user){
      if(err) return done(err);
      if(user) return done(null, false, req.flash('signupMessage','e-Mail already in use.'));
      
      var newUser = new User();
      newUser.email = email;
      newUser.password = newUser.generateHash(password);
      
      newUser.save(function(err){
        if(err) throw err;
        
        return done(null, newUser);
      });
    });
  });
}));


passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done){
    User.findOne({'email': email}, function(err, user){
      if(err) return done(err);
      if(!user) return done(null, false, req.flash('loginMessage','wrong user/password'));
      
      if(!user.validPassword(password)) return done(null, false, req.flash('loginMessage','wrong user/password'));

      
      return done(null, user);
    });
  
}));
/*

// middleware to send user info/status
app.use(function(req, res, next) {
  //res.locals.user = req.user;
  res.locals = {
        user: req.user
  };
  res.locals.authenticated = req.isAuthenticated();
  next();
})

*/
////////////////************* end passport


///////////// routes


app.get('/login', function(req,res){
    res.render('login.ejs', { message: req.flash('loginMessage') });
});

app.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
});
    
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/books', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/books', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));
  

app.get('/logout', function(req,res){
  req.logout();
  res.redirect("/");
});

app.get('/',function(req,res){
//  res.sendFile(path.resolve(path.join(__dirname, '../public')+'/index.html'));
console.log("user logged???? ", req.user);
  res.render('index.ejs', {user: req.user, message: req.flash('loginMessage')});
});

//// CORS

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, HEAD, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === 'OPTIONS') {
        return res.end();
    }
    next();
});


// api 
app.use('/api/books', require('./api/books'));
//app.use('/api/places', require('./api/places'));

/*
// all undefined asset or api routes should return 404 (from yeoman code)
app.route('/:url(api|auth|components)/*').get(function(req,res){
  console.log("herer url regex");
  return res.status(404).json({status:404});
});

*/

//all others resources should redirect to the index.html

app.route('*').get(function(req,res){
//  res.sendFile(path.resolve(path.join(__dirname, '../public')+'/index.html'));
console.log("all * routes: user",req.user);
  res.render('index.ejs', {user: req.user, message: req.flash('loginMessage')})
});



/*
app.use(function(req, res){
   res.sendStatus(404);
});
*/

var server = http.createServer(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});


//////////////////////// socket.io
/*
var Stocks = require('./api/stocks/stocks_model');
function registerSocket(socket){
  Stocks.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Stocks.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  console.log("emiting save");
  socket.emit('save', doc);
}

function onRemove(socket, doc, cb) {
  console.log("emiting remove");
  socket.emit('remove', doc);
}

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
  registerSocket(socket);
});

*/