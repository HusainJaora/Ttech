const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {updateSupplier,updateTechnician,updateProductCategories} = require("../../controller/Master/editMasterController");
const {supplierValidation,validateTechnician,validateDuplicateProductCategory,validateProductCategory} = require("../../middleware/mastervalidation");
const {validateDuplicateTechnicianEdit,validateDuplicateSupplierEdit} = require("../../middleware/masterEditvalidation");

// Supplier
router.put("/supplier/:supplier_id",validateToken,supplierValidation,validateDuplicateSupplierEdit,updateSupplier);
// Technician
router.put("/edit-technician/:technician_id",validateToken,validateDuplicateTechnicianEdit,validateTechnician,updateTechnician);
// Product category
router.put("/edit-product_category/:product_category_id",validateToken,validateDuplicateProductCategory,validateProductCategory,updateProductCategories);


module.exports = router;



