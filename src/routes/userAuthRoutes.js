const express = require("express");
const router = express.Router();
const {signup,login} = require("../controller/userAuthController");
const {validateDuplicateUser, signupValidation, validateLogin,} = require("../middleware/uservalidation");


router.post('/signup',signupValidation,validateDuplicateUser,signup);
router.post('/login',validateLogin,login)

module.exports = router;