const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {deleteSupplier,deleteBrand,deleteTechnician,deleteProductCategories} = require("../../controller/Master/deleteMasterController");

// supplier
router.delete("/delete-supplier/:supplier_id",validateToken,deleteSupplier);
// Brand
router.delete("/delete-brand/:brand_id",validateToken,deleteBrand);
// Technician
router.delete("/delete-technician/:technician_id",validateToken,deleteTechnician);
// Product category
router.delete("/delete-productCategory/:product_category_id",validateToken,deleteProductCategories);


module.exports = router;    