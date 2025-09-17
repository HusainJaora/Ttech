const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authToken");
const {addPurchasePrice,updatePurchasePrice,deletePurchasePrice, getAllPurchases} = require("../controller/purchase");

router.put("/add-purchase-detail/:invoice_id", validateToken,addPurchasePrice);
router.put("/update-purchase-detail/:invoice_id",validateToken,updatePurchasePrice);
router.delete("/delete-purchase-detail/:invoice_item_id",validateToken,deletePurchasePrice);
router.get("/",validateToken,getAllPurchases);


module.exports = router;