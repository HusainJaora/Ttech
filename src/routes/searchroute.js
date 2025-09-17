const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authToken");
const {searchSuppliers, searchTechnicians, searchProductCategories,searchInvoices,searchQuotations,
searchInquiries,searchRepairs,searchCustomers} = require("../controller/search");

router.get("/supplier",validateToken,searchSuppliers);
router.get("/technician",validateToken,searchTechnicians);
router.get("/product-categories",validateToken,searchProductCategories);
router.get("/invoices",validateToken,searchInvoices);
router.get("/quotations",validateToken,searchQuotations);
router.get("/inquiries",validateToken,searchInquiries);
router.get("/repairs",validateToken,searchRepairs);
router.get("/customers",validateToken,searchCustomers);

module.exports = router;