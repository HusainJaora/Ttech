const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {getAllSuppliers,getSingleSupplier, getAllTechnician, getSingleTechnician, getAllProductCategory} = require("../../controller/Master/getMasterController");

router.get("/supplier-list",validateToken,getAllSuppliers);
router.get("/supplier-detail/:supplier_id",validateToken,getSingleSupplier);

router.get("/technician-list",validateToken,getAllTechnician);
router.get("/technician-detail/:technician_id",validateToken,getSingleTechnician);

router.get("/productCategory-list",validateToken,getAllProductCategory);

module.exports = router;