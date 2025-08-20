const express = require("express");
const router = express.Router();

const refreshTokenController = require("../controller/refreshTokenController");

router.post("/refresh", refreshTokenController);

module.exports = router;