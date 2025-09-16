const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authToken");
const {addPurchasePrice,updatePurchasePrice,deletePurchasePrice} = require("../controller/purchase");

router.put("/add-purchase-detail/:invoice_id", validateToken,addPurchasePrice);
router.put("/update-purchase-detail/:invoice_id",validateToken,updatePurchasePrice);
router.delete("/delete-purchase-detail/:invoice_item_id",validateToken,deletePurchasePrice)

module.exports = router;