const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add the user name K"],
    },
    email: {
      type: String,
      required: [true, "Please add the email K"],
      unique: [true, "Email address already taken K"],
    },
    password: {
      type: String,
      required: [true, "Please fill the password field K"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
