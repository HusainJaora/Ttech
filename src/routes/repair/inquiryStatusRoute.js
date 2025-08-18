const express = require("express");
const router = express.Router();
const {assignTechnician,updateTechnician} = require("../../controller/repair/inquiryStatus");
const {assignTechnicianValidation,updateTechnicianValidation} = require("../../middleware/inquiryStatusValidation");
const validateToken = require("../../middleware/authToken");

router.post("/:inquiry_id/assign",validateToken,assignTechnicianValidation,assignTechnician,);
router.post("/:inquiry_id/update-technician",validateToken,updateTechnicianValidation,updateTechnician);

module.exports = router;