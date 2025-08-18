const express = require("express");
const router = express.Router();
const {quotationStatus} = require("../../controller/quotation/quotationStatus");
const {quotationStatusValidation} = require("../../middleware//quotationStatusValidation");
const validateToken = require("../../middleware/authToken");


router.patch("/:quotation_id",validateToken,quotationStatusValidation,quotationStatus);


module.exports = router;



