const express = require("express");
const router = express.Router();
const {getAllRepair,getSingleRepair} = require("../../controller/repair/repair");
const validateToken = require("../../middleware/authToken");
const repairStatusValidation = require("../../middleware/repairStatusValidation")
router.get("/repair-detail/:repair_id",validateToken,getSingleRepair);
router.get("/",validateToken,getAllRepair);


module.exports = router;