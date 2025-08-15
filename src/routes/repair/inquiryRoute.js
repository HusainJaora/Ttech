const express = require("express");
const router = express.Router();
const {checkCustomerByContact,addInquiry} = require("../../controller/repair/inquiry");
const validateToken = require("../../middleware/authToken");
const {addinquiryValidation,checkCustomerByContactValidation} = require("../../middleware/inquiryvalidation");

router.post("/check-customer",validateToken,checkCustomerByContactValidation,checkCustomerByContact);
router.post("/add-inquiry",validateToken,addinquiryValidation,addInquiry);

module.exports = router