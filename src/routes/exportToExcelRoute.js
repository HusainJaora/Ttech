const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authToken");
const {exportInvoice} = require("../controller/exportToExcel");

router.post("/invoices",validateToken,exportInvoice);

module.exports = router;


