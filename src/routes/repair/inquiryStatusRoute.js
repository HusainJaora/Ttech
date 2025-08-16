const express = require("express");
const router = express.Router();
const {assignTechnician} = require("../../controller/repair/inquiryStatus");
const {assignTechnicianValidation} = require("../../middleware/inquiryStatusValidation");
const validateToken = require("../../middleware/authToken");

router.post("/:inquiry_id/assign",validateToken,assignTechnicianValidation,assignTechnician,);

module.exports = router;