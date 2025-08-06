const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {updateSupplier,updatebrand} = require("../../controller/Master/editMasterController");
const {validateDuplicateSupplier,validateDuplicateBrand} = require("../../middleware/mastervalidation");

router.put("/edit-supplier/:supplier_id",validateToken,validateDuplicateSupplier,updateSupplier);
router.put("/edit-brand/:brand_id",validateToken,validateDuplicateBrand,updatebrand);



module.exports = router;



