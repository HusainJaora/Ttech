const express = require("express");
const router = express.Router();
const {addSupplier,addBrand,addTechnician} = require("../../controller/Master/addMasterController");

const validateToken = require("../../middleware/authToken");
const {validateDuplicateSupplier,supplierValidation,validateDuplicateBrand,validateBrand,validateDuplicateTechnician,validateTechnician} = require("../../middleware/mastervalidation");
// Supplier
router.post("/add-supplier",validateToken,validateDuplicateSupplier,supplierValidation,addSupplier);
// Brand
router.post("/add-brand",validateToken,validateDuplicateBrand,validateBrand,addBrand);
// Technician
router.post("/add-technician",validateToken,validateDuplicateTechnician,validateTechnician,addTechnician)



module.exports = router;