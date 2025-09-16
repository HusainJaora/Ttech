const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authToken");
const {addPurchasePrice} = require("../controller/purchase");

router.put("/add-purchase-detail/:invoice_id", validateToken,addPurchasePrice);

module.exports = router;