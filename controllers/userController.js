const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const registerUser = asyncHandler(async (req, res) => {
  // we initialized the body values into variable names here

  const { username, email, password } = req.body;

  // if any field is empty

  if (!username) {
    res.status(400);
    throw new Error("Username is mandatory");
  } else if (!email) {
    res.status(400);
    throw new Error("Email is mandatory");
  } else if (!password) {
    res.status(400);
    throw new Error("Password field is mandatory");
  }

  // if email id is already registered
  // means here we use findOne and parameter is email and in object
  // so here the email which user typed in body is checked
  // whether it is inside mongoDB or not

  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User Already registered");
  }

  // Hash Password

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("The hashed password is:", hashedPassword);

  // create user in mongoDB

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  console.log(`User created ${user}`);

  // if successfully user created then only show
  // response to the user (so if statement is kept)

  if (user) {
    res.status(201).json({
      _id: user.id, // only id and email address would
      email: user.email, // be shown to user as response
    });
  } else {
    res.status(400);
    throw new Error("User data not Valid");
  }
});

////////////////////////////////////////////////////////////////

const loginUser = asyncHandler(async (req, res) => {
  // first of all we have to fetch what user typed inside body

  const { email, password } = req.body;

  // if any field is empty

  if (!email) {
    res.status(400);
    throw new Error("Email is mandatory");
  } else if (!password) {
    res.status(400);
    throw new Error("Password field is mandatory");
  }

  // finding useremail and checking if it is not present
  // inside our DB, if not tell to register

  const userEmail = await User.findOne({ email });

  if (!userEmail) {
    res.status(400);
    throw new Error("Email is not registered yet");
  }

  // once we found user's email from database (we store that in var)
  // as that variable will stay inside that block and we can get
  // all info of that block through it (including pass with dot keyword)
  // hence we were able to use, userEmail.password lol

  const decryptedPass = await bcrypt.compare(password, userEmail.password);

  // now since bcrypt.compare provides a boolean value
  // so here if they are same then decryptedPass is a truthy value

  // now if decryptedPass is a truthy value, we have to give
  // them a jwt token (hooray)

  if (decryptedPass) {
    // access token making is in process
    const accessToken = jwt.sign(
      // we have to pass a payload inside object in sign method
      {
        user: {
          username: userEmail.username,
          email: userEmail.email,
          id: userEmail._id,
        },
      }, // now we have to pass a secret key
      // who tf knows y
      // (edit): ACCESS_TOKEN_SECRET is used to verify the token is
      // real or not and if slightly changed, jwt's methods will
      // identify malicious activities if done
      process.env.ACCESS_TOKEN_SECRET,
      // now since token is generated, we have to pass an
      // expiration time of that particular token
      {
        expiresIn: "30d",
      }
    );
    // sending access token as response
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("Your password is incorrect");
  }
});

//////////////////////////////////////////////////////////////

const currentUser = asyncHandler(async (req, res) => {
  // in order to validate the real token, we made
  // a middleware, which will help to validate user
  // idk how
  //(edit): ik now, that how it is done lol

  const { email } = req.body;

  const findingEmail = await User.findOne({ email });

  res.status(200).json({
    id: findingEmail._id,
    username: findingEmail.username,
    email: findingEmail.email,
  });
  /*
  {
    id: findingEmail._id,
    username: findingEmail.username,
    email: findingEmail.email,
  }
  */
});

//////////////////////////////////////////////

module.exports = { registerUser, loginUser, currentUser };
