const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {addProfile, getProfile} = require("../../controller/userProfile/profile");
const { uploader } = require("../../middleware/userProfile/cloudinaryUpload");


router.post("/add-profile", validateToken, uploader.single("logo"), addProfile);

module.exports = router;