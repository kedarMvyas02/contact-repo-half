const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  let token;

  // authHeader means that user will provide a bearer
  // token and it is stored in authorization section
  // atleast in postman, real life who knows

  // so here we fetch the bearer token
  // first Authorization is HTTP headers in key value and
  // description pair and second one is in bearer section
  let authHeader = req.headers.Authorization || req.headers.authorization;
  // so here we got the token if present

  if (authHeader && authHeader.startsWith("Bearer")) {
    // bearer could be just to identify token
    // since it is useless, we will use split and fetch token

    token = authHeader.split(" ")[1];

    // now we will compare the token provided by user or we can
    // also call them bearer, so we will compare token with
    // our secret key with jwt's own method named as jwt.verify()

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("User is not Authorized");
      } else {
        // kedar = decoded.user;
        console.log("Jai hind");
        next();
      }
    });
  } else {
    res.status(401);
    throw new Error("Token is missing");
  }
});

module.exports = validateToken;
