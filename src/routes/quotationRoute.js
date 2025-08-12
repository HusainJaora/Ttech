const express = require("express");
const router = express.Router();
const {addQuotation,updateQuotation,deleteQuotation} = require("../controller/quotation");
const validateToken = require("../middleware/authToken");

router.post("/add-quotation",validateToken,addQuotation);
router.put("/edit-quotation/:quotation_id",validateToken,updateQuotation)
router.delete("/delete-quotation/:quotation_id",validateToken,deleteQuotation)

module.exports = router;