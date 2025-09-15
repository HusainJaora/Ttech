const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {addPayment, deletePayment, getSinglePayment} = require("../../controller/invoice/payment");
const {addPaymentValidation, deletePaymentValidation} = require("../../middleware/paymentValidation");

// add payment here 
router.post("/add-payment",validateToken,addPaymentValidation,addPayment);
router.delete("/delete-payment/:payment_id",validateToken, deletePaymentValidation, deletePayment);
router.get("/payment-detail/:invoice_id",validateToken,getSinglePayment);


module.exports = router;