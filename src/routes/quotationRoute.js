const express = require("express");
const router = express.Router();
const {addQuotation,updateQuotation} = require("../controller/quotation");
const validateToken = require("../middleware/authToken");

router.post("/add-quotation",validateToken,addQuotation);
router.put("/edit-quotation/:quotation_id",validateToken,updateQuotation)

module.exports = router;