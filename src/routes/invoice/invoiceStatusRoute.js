const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {invoiceStatus} = require("../../controller/invoice/invoiceStatus");
const {invoiceStatusValidation} = require("../../middleware/invoiceStatusValidation");

router.post("/update-status",validateToken,invoiceStatusValidation,invoiceStatus);

module.exports = router;