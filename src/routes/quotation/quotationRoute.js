const express = require("express");
const router = express.Router();
const {addQuotation,updateQuotation,deleteQuotation, getAllQuotation, getSingleQuotation} = require("../../controller/quotation/quotation");
const validateToken = require("../../middleware/authToken");
const {addQuotationValidation, updateQuotationValidation, deleteQuotationValidation} = require("../../middleware/quotationValidation");

router.post("/add-quotation",validateToken,addQuotationValidation,addQuotation);
router.put("/edit-quotation/:quotation_id",validateToken,updateQuotationValidation,updateQuotation);
router.delete("/delete-quotation/:quotation_id",validateToken,deleteQuotationValidation,deleteQuotation);
router.get("/",validateToken,getAllQuotation);
router.get("/quotation-detail/:quotation_id",validateToken,getSingleQuotation);


module.exports = router;