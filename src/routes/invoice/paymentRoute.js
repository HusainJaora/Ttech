const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {addPayment} = require("../../controller/invoice/payment");
const {addPaymentValidation} = require("../../middleware/paymentValidation");

// add payment here 
router.post("/add-payment",validateToken,addPaymentValidation,addPayment);


module.exports = router;