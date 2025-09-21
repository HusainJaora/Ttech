const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const ensureAdmin = require("../../middleware/ensureadmin");
const {signupValidation, validateDuplicateUser} = require("../../middleware/uservalidation");
const signup = require("../../controller/admin/createUser");

router.post('/signup',validateToken,ensureAdmin,signupValidation,validateDuplicateUser,signup);

module.exports = router;