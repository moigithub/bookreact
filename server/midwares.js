var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

// check JWT middleware
// it will afffect all below THIS line routes
exports.checkToken = function (req, res, next) {
  var token = req.headers['authorization'];
//  console.log("headers",req.headers);
  if(token){
    jwt.verify(token, 'sekretJWT', function(err, decoded){
      if(err) return res.json({message:'auth failed.'})
      
      req.decoded = decoded;
      return next();
    })
  } else {
    console.log("no token");
    return res.status(403).send({message:'Access not allowed.'});
  }
};

//check if is logged middleware
exports.isLoggedIn = function (req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}