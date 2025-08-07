const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {updateSupplier,updatebrand,updateTechnician} = require("../../controller/Master/editMasterController");
const {validateDuplicateSupplier,validateDuplicateBrand,validateTechnician} = require("../../middleware/mastervalidation");
const {validateDuplicateTechnicianEdit} = require("../../middleware/masterEditvalidation");

router.put("/edit-supplier/:supplier_id",validateToken,validateDuplicateSupplier,updateSupplier);
router.put("/edit-brand/:brand_id",validateToken,validateDuplicateBrand,updatebrand);
router.put("/edit-technician/:technician_id",validateToken,validateDuplicateTechnicianEdit,validateTechnician,updateTechnician);




module.exports = router;



