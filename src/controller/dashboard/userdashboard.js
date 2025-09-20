const db = require("../../db/database");

// Revenue for current month and compared to last month 
const getRevenue = async (req, res, returnData = false) => {
  const { signup_id } = req.user; // from JWT auth

  try {
    const [rows] = await db.query(
      `
      SELECT 
        IFNULL(SUM(CASE 
            WHEN MONTH(invoice_date) = MONTH(CURRENT_DATE())
             AND YEAR(invoice_date) = YEAR(CURRENT_DATE())
             AND status = 'PAID'
            THEN grand_total END), 0) AS total_revenue,

        IFNULL(SUM(CASE 
            WHEN MONTH(invoice_date) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
             AND YEAR(invoice_date) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
             AND status = 'PAID'
            THEN grand_total END), 0) AS last_month_revenue
      FROM invoices
      WHERE signup_id = ? 
      AND status = 'PAID'
      `,
      [signup_id]
    );

    const totalRevenue = Number(rows[0].total_revenue) || 0;
    const lastMonthRevenue = Number(rows[0].last_month_revenue) || 0;

    let revenueGrowthPercent;

    if (lastMonthRevenue === 0) {
      // If last month was 0 and current month > 0, treat as 100%
      revenueGrowthPercent = totalRevenue > 0 ? 100 : 0;
    } else {
      // Normal growth calculation
      revenueGrowthPercent = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    }

    const result = {
      totalRevenue,
      revenueGrowthPercent: Number(revenueGrowthPercent.toFixed(2)) // always numeric
    };

    if (returnData) return result;
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    if (returnData) throw error;
    res.status(500).json({ message: "Server error" });
  }
};

// Revenue line chart for 6 months 
const getSixMonthRevenue = async (req, res, returnData = false) => {
  const { signup_id } = req.user;

  try {
    const startQuery = new Date(new Date().setMonth(new Date().getMonth() - 5))
      .toISOString()
      .split("T")[0];
    const endQuery = new Date().toISOString().split("T")[0];

    const [monthlyRevenue] = await db.query(
      `
      WITH RECURSIVE months AS (
        SELECT DATE_FORMAT(?, '%Y-%m-01') AS month_start
        UNION ALL
        SELECT DATE_ADD(month_start, INTERVAL 1 MONTH)
        FROM months
        WHERE month_start < DATE_FORMAT(?, '%Y-%m-01')
      )
      SELECT 
        DATE_FORMAT(m.month_start, '%Y-%m') AS month,
        IFNULL(SUM(i.grand_total), 0) AS monthly_revenue
      FROM months m
      LEFT JOIN invoices i
        ON DATE_FORMAT(i.invoice_date, '%Y-%m') = DATE_FORMAT(m.month_start, '%Y-%m')
        AND i.signup_id = ?
        AND i.status = 'PAID'
      GROUP BY m.month_start
      ORDER BY m.month_start
      `,
      [startQuery, endQuery, signup_id]
    );

    const result = { monthlyRevenue };

    if (returnData) return result;
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    if (returnData) throw error;
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { getRevenue, getSixMonthRevenue };
