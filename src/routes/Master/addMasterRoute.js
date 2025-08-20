const express = require("express");
const router = express.Router();
const {addSupplier,addTechnician,addProductCategories} = require("../../controller/Master/addMasterController");

const validateToken = require("../../middleware/authToken");
const {validateDuplicateSupplier,supplierValidation,validateDuplicateTechnician,validateTechnician,validateDuplicateProductCategory,
    validateProductCategory} = require("../../middleware/mastervalidation");
// Supplier
router.post("/supplier",validateToken,validateDuplicateSupplier,supplierValidation,addSupplier);
// Technician
router.post("/add-technician",validateToken,validateDuplicateTechnician,validateTechnician,addTechnician);
// Category
router.post("/add-category",validateToken,validateDuplicateProductCategory,validateProductCategory,addProductCategories);

module.exports = router;