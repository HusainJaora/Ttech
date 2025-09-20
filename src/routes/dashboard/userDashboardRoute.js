const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const { getRevenue, getSixMonthRevenue } = require("../../controller/dashboard/userdashboard");

// Keep old routes
router.get("/one-month-revenue", validateToken, getRevenue);
router.get("/six-month-revenue", validateToken, getSixMonthRevenue);

// New aggregator route
router.get("/", validateToken, async (req, res) => {
  try {
    const revenue = await getRevenue(req, res, true);
    const sixMonths = await getSixMonthRevenue(req, res, true);

    res.json({
      revenue,
      sixMonths,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
