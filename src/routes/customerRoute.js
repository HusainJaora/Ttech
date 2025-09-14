const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authToken");
const {addCustomer,updateCustomer,getAllcustomer, getSingleCustomer} = require("../controller/customer");
const {addCustomerValidation,updateCustomerValidation,getAllCustomerValidation} = require("../middleware/customerValidation");

router.post("/add-customer",validateToken,addCustomerValidation,addCustomer);
router.put("/update-customer/:customer_id",validateToken,updateCustomerValidation,updateCustomer);
router.get("/",validateToken,getAllCustomerValidation,getAllcustomer);
router.get("/customer-detail/:customer_id",validateToken,getSingleCustomer);

module.exports = router;
