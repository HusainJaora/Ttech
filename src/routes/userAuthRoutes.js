const express = require("express");
const router = express.Router();
const login = require("../controller/userAuthController");
const {validateLogin,loginLimiter} = require("../middleware/uservalidation");



// router.post('/signup',signupValidation,validateDuplicateUser,signup);
router.post('/login',loginLimiter,validateLogin,login);

module.exports = router;