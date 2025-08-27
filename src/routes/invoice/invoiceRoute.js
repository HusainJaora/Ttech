const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {createInvoice} = require("../../controller/invoice/invoice");
const {createInvoiceValidation} = require("../../middleware/invoiceValidation");

router.post("/create-invoice",validateToken,createInvoiceValidation,createInvoice);

module.exports = router;