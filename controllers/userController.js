const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const crypto = require("crypto");
const sendEmail = require("../models/nodeMailer");

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

  // finding userEMail(P) and checking if it is not present
  // inside our DB, if not tell to register

  const userEmail = await User.findOne({ email });

  if (!userEmail) {
    res.status(400);
    throw new Error("Email is not registered yet");
  }

  // once we found user's email from database (we store that in var)
  // as that variable will stay inside that block and we can get
  // all info of that block through it (including pass with dot keyword)
  // hence we were able to use, userEMail(P).password lol

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
        id: userEmail._id,
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

  const { email, password } = req.body;
  const decryptedPass = await bcrypt.compare(password, req.user.password);
  if (req.user.email === email && decryptedPass) {
    res.status(200).json(req.user);
  } else {
    res.status(401);
    throw new Error("u entered wrong email or password");
  }

  /*
  res.status(200).json({
    id: findingEmail._id,
    username: findingEmail.username,
    email: findingEmail.email,
  });
  */
});

//////////////////////////////////////////////

const deleteUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is mandatory");
  } else if (!password) {
    res.status(400);
    throw new Error("Password field is mandatory");
  }

  const userEmail = await User.findOne({ email });

  if (!userEmail) {
    res.status(400);
    throw new Error("Email is not registered yet");
  }

  const decryptedPass = await bcrypt.compare(password, userEmail.password);

  if (decryptedPass) {
    await userEmail.deleteOne({ _id: req.params.id });
    res.status(200).json({
      message: "Your Contact has been deleted Successfully",
    });
  } else {
    res.status(400).json({
      message: "Your password is wrong",
    });
  }
});

////////////////////////////////////////////////////////////////////////

const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Error("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  const data = await user.save({ validateBeforeSave: false });

  console.log(typeof data.passwordResetToken);

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetpassword/${resetToken}`;

  const message = `Hey ${user.username}, \n Forgot your password? Don't Worry :) \n Submit a PATCH request with your new password to: ${resetURL} \n If you didn't forget your password, please ignore this email ! `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password token is valid only for 10 mins!",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
      user,
      token: resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      res.json({
        err: err.message,
      })
    );
  }
});

////////////////////////////////////////////////////

const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  console.log("hashed token is......", typeof hashedToken);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  console.log("The user is here: ", user);

  // 2) if token not expired and there is a user, set new password
  if (!user) {
    return next(new Error("Token is invalid", 400));
  }
  const temp = req.body.password;
  const hashedPassword = await bcrypt.hash(temp, 10);
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) update changedPasswordAt property for the user

  // 4) log the user in, send jwt

  const accessToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );
  res.status(200).json({ accessToken });
});

////////////////////////////////////////////////////

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  forgotPassword,
  resetPassword,
  deleteUser,
};
