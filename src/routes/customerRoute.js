const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authToken");
const {addCustomer,updateCustomer,getAllcustomer} = require("../controller/customer");
const {addCustomerValidation,updateCustomerValidation,getAllCustomerValidation} = require("../middleware/customerValidation");

router.post("/add-customer",validateToken,addCustomerValidation,addCustomer);
router.put("/update-customer/:customer_id",validateToken,updateCustomerValidation,updateCustomer);
router.get("/",validateToken,getAllCustomerValidation,getAllcustomer);

module.exports = router;
