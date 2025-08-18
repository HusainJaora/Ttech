const express = require("express");
const router = express.Router();
const {assignTechnician,updateTechnician,markInquiryDone,cancelInquiry} = require("../../controller/repair/inquiryStatus");
const {assignTechnicianValidation,updateTechnicianValidation,MarkInquiryDoneValidation,cancelInquiryValidation} = require("../../middleware/inquiryStatusValidation");
const validateToken = require("../../middleware/authToken");

router.post("/:inquiry_id/assign",validateToken,assignTechnicianValidation,assignTechnician,);
router.patch("/:inquiry_id/update-technician",validateToken,updateTechnicianValidation,updateTechnician);
router.patch("/:inquiry_id/status-done",validateToken,MarkInquiryDoneValidation,markInquiryDone)
router.patch("/:inquiry_id/status-cancelled",validateToken,cancelInquiryValidation,cancelInquiry);

module.exports = router;