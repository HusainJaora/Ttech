const express = require("express");
const router = express.Router();
const repairStatus = require("../../controller/repair/repairStatus");
const repairStatusValidation = require("../../middleware/repairStatusValidation");
const validateToken = require("../../middleware/authToken");

router.put("/:repair_id",validateToken,repairStatusValidation,repairStatus);



module.exports = router;