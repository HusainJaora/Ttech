const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {updateSupplier,updatebrand,updateTechnician,updateProductCategories} = require("../../controller/Master/editMasterController");
const {validateDuplicateSupplier,validateDuplicateBrand,validateTechnician,validateDuplicateProductCategory,validateProductCategory} = require("../../middleware/mastervalidation");
const {validateDuplicateTechnicianEdit} = require("../../middleware/masterEditvalidation");

// Supplier
router.put("/edit-supplier/:supplier_id",validateToken,validateDuplicateSupplier,updateSupplier);
// Brand
router.put("/edit-brand/:brand_id",validateToken,validateDuplicateBrand,updatebrand);
// Technician
router.put("/edit-technician/:technician_id",validateToken,validateDuplicateTechnicianEdit,validateTechnician,updateTechnician);
// Product category
router.put("/edit-product_category/:product_category_id",validateToken,validateDuplicateProductCategory,validateProductCategory,updateProductCategories);


module.exports = router;



