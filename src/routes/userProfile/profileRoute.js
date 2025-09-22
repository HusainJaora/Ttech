const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const {addProfile, getProfile} = require("../../controller/userProfile/profile");
const { uploader } = require("../../middleware/userProfile/cloudinaryUpload");
const {addProfileValidation} = require("../../middleware/userProfile/profileValidation");


router.post("/add-profile", validateToken, uploader.single("logo"),addProfileValidation, addProfile);
router.get("/", validateToken,getProfile );

module.exports = router;