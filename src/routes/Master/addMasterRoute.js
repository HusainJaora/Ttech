const express = require("express");
const router = express.Router();
const {addSupplier,addBrand} = require("../../controller/Master/addMasterController");

const validateToken = require("../../middleware/authToken");
const {validateDuplicateSupplier,supplierValidation,validateDuplicateBrand,validateBrand} = require("../../middleware/mastervalidation");

router.post("/add-supplier",validateToken,validateDuplicateSupplier,supplierValidation,addSupplier);
router.post("/add-brand",validateToken,validateDuplicateBrand,validateBrand,addBrand)

module.exports = router;