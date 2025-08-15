const express = require("express");
const router = express.Router();
const {addInquiry,updateInquiry} = require("../../controller/repair/inquiry");
const validateToken = require("../../middleware/authToken");
const {addinquiryValidation,updateInquiryValidation} = require("../../middleware/inquiryvalidation");


router.post("/add-inquiry",validateToken,addinquiryValidation,addInquiry);
router.put("/update-inquiry/:inquiry_id",validateToken,updateInquiryValidation,updateInquiry);

module.exports = router