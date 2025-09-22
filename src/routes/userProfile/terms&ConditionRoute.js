const express = require("express");
const router = express.Router();
const {
  addTerm,
  updateTerm,
  deleteTerm,
  getTerms
} = require("../../controller/userProfile/terms&Condition");
const validateToken = require("../../middleware/authToken");


router.post("/add", validateToken, addTerm);
router.put("/update-terms/:term_id", validateToken, updateTerm);
router.delete("/delete-terms/:term_id", validateToken, deleteTerm);
router.get("/", validateToken, getTerms);

module.exports = router;
