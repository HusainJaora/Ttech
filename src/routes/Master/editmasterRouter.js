const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {updateSupplier} = require("../../controller/Master/editMasterController");
const {validateDuplicateSupplier} = require("../../middleware/mastervalidation");

router.put("/edit-supplier/:supplier_id",validateToken,validateDuplicateSupplier,updateSupplier);


module.exports = router;



