const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/authToken");
const {exportSuppliers,exportTechnician,exportProductCategory,exportInvoice,exportQuotation,exportInquiries,exportRepairs,exportCustomers} = require("../controller/exportToExcel");

router.post("/suppliers",validateToken,exportSuppliers);
router.post("/technicians",validateToken,exportTechnician);
router.post("/product-categories",validateToken,exportProductCategory);
router.post("/invoices",validateToken,exportInvoice);
router.post("/quotations",validateToken,exportQuotation);
router.post("/inquiries",validateToken,exportInquiries);
router.post("/repairs",validateToken,exportRepairs);
router.post("/customers",validateToken,exportCustomers);




module.exports = router;


