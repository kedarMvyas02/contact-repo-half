const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  forgotPassword,
  resetPassword,
  deleteUser,
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/current", validateToken, currentUser);
router.post("/forgotPassword", forgotPassword);
router.delete("/deleteUser", deleteUser);
router.patch("/resetPassword/:token", resetPassword);

module.exports = router;
