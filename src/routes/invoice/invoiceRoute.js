const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {createInvoice,updateInvoice} = require("../../controller/invoice/invoice");
const {createInvoiceValidation} = require("../../middleware/invoiceValidation");

router.post("/create-invoice",validateToken,createInvoiceValidation,createInvoice);
router.put("/update-invoice/:invoice_id",validateToken,updateInvoice)

module.exports = router;