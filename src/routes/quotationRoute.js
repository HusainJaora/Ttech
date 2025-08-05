const express = require("express");
const router = express.Router();
const {addQuotation} = require("../controller/quotation");
const validateToken = require("../middleware/authToken");

router.post("/add-quotation",validateToken,addQuotation);

module.exports = router;