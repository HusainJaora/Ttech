const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authToken");
const {addCustomer,updateCustomer} = require("../controller/customer");
const {addCustomerValidation,updateCustomerValidation} = require("../middleware/customerValidation");

router.post("/add-customer",validateToken,addCustomerValidation,addCustomer);
router.put("/update-customer/:customer_id",validateToken,updateCustomerValidation,updateCustomer);

module.exports = router;
