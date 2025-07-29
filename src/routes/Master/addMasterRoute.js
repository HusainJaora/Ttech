const express = require("express");
const router = express.Router();
const {addSupplier} = require("../../controller/Master/addMasterController");
const validateToken = require("../../middleware/authToken");
const {validateDuplicateSupplier,supplierValidation} = require("../../middleware/mastervalidation");

router.post("/add-supplier",validateToken,validateDuplicateSupplier,supplierValidation,addSupplier);

module.exports = router;