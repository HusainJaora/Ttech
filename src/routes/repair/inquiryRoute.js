const express = require("express");
const router = express.Router();
const {checkCustomerByContact,addInquiry} = require("../../controller/repair/inquiry");
const validateToken = require("../../middleware/authToken");

router.post("/check-customer",validateToken,checkCustomerByContact);
router.post("/add-inquiry",validateToken,addInquiry);

module.exports = router