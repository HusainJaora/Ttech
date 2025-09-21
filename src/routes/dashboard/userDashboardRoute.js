const express = require("express");
const router = express.Router();
const validateToken = require("../../middleware/authToken");
const { getRevenue, getSixMonthRevenue,getOutstandingTotal,getTodaysInvoices,getOutstandingInvoices, getRepairStatusCounts,getRepairsByStatus } = require("../../controller/dashboard/userdashboard");

// clicable links from dashboard
router.get("/outstanding-invoices", validateToken, getOutstandingInvoices);
router.get("/repair-by-status/:status", validateToken, getRepairsByStatus);

// New aggregator route
router.get("/", validateToken, async (req, res) => {
  try {
    const revenue = await getRevenue(req, res, true);
    const sixMonths = await getSixMonthRevenue(req, res, true);
    const OutstandingTotal = await getOutstandingTotal(req, res, true);
    const RepairStatusCounts = await getRepairStatusCounts(req, res, true);
    const TodaysInvoices = await getTodaysInvoices(req, res, true);

    res.json({
      revenue,
      sixMonths,
      OutstandingTotal,
      RepairStatusCounts,
      TodaysInvoices

    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
