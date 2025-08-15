const express = require("express");
const router = express.Router();
const {addInquiry} = require("../../controller/repair/inquiry");
const validateToken = require("../../middleware/authToken");
const {addinquiryValidation} = require("../../middleware/inquiryvalidation");


router.post("/add-inquiry",validateToken,addinquiryValidation,addInquiry);

module.exports = router