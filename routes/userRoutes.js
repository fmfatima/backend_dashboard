const validateToken = require("../middleware/validateTokenHandler");

const express = require("express");
const { 
    registerUser, 
    loginUser,
    currentUser,
    forgetPassword
 } = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login",loginUser);
 
router.get("/current", validateToken, currentUser);

router.post("/forgetPassword", forgetPassword)

module.exports = router;