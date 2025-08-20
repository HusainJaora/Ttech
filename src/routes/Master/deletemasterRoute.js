const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {deleteSupplier,deleteTechnician,deleteProductCategories} = require("../../controller/Master/deleteMasterController");

// supplier
router.delete("/supplier/:supplier_id",validateToken,deleteSupplier);
// Technician
router.delete("/delete-technician/:technician_id",validateToken,deleteTechnician);
// Product category
router.delete("/delete-productCategory/:product_category_id",validateToken,deleteProductCategories);


module.exports = router;    