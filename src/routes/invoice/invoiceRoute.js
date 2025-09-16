const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {createInvoice,updateInvoice,getAllInvoice, getSingleInvoice} = require("../../controller/invoice/invoice");
const {createInvoiceValidation,updateInvoiceValidation} = require("../../middleware/invoiceValidation");

router.post("/create-invoice",validateToken,createInvoiceValidation,createInvoice);
router.put("/update-invoice/:invoice_id",validateToken,updateInvoiceValidation,updateInvoice);
router.get("/",validateToken,getAllInvoice);
router.get("/invoice-detail/:invoice_id",validateToken,getSingleInvoice);



module.exports = router;