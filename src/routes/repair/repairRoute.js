const express = require("express");
const router = express.Router();
const {getAllRepair} = require("../../controller/repair/repair");
const validateToken = require("../../middleware/authToken");

router.get("/",validateToken,getAllRepair);

module.exports = router;