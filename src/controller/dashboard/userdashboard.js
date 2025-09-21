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
             AND status NOT IN ('CANCELLED','DRAFT')
            THEN grand_total END), 0) AS total_revenue,

        IFNULL(SUM(CASE 
            WHEN MONTH(invoice_date) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
             AND YEAR(invoice_date) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
             AND status NOT IN ('CANCELLED','DRAFT')
            THEN grand_total END), 0) AS last_month_revenue
      FROM invoices
      WHERE signup_id = ? 
      AND status NOT IN ('CANCELLED','DRAFT')
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
        AND i.status NOT IN ('CANCELLED','DRAFT')
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

// Total Outstanding amount 
const getOutstandingTotal = async (req, res, returnData = false) => {
  const { signup_id } = req.user;

  try {
    // Total outstanding now (all unpaid invoices)
    const [totalRows] = await db.query(
      `
      SELECT IFNULL(SUM(amount_due), 0) AS total_outstanding
      FROM invoices
      WHERE signup_id = ? 
        AND status IN ('ISSUED', 'PARTIALLY_PAID')
      `,
      [signup_id]
    );

    // Total outstanding as of last month (all unpaid invoices created before start of this month)
    const [lastMonthRows] = await db.query(
      `
      SELECT IFNULL(SUM(amount_due), 0) AS total_outstanding
      FROM invoices
      WHERE signup_id = ?
        AND status IN ('ISSUED', 'PARTIALLY_PAID')
        AND invoice_date < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
      `,
      [signup_id]
    );

    const totalOutstanding = Number(totalRows[0].total_outstanding);
    const lastMonthOutstanding = Number(lastMonthRows[0].total_outstanding);

    // Calculate % change
    let percentChange = 0;
    if (lastMonthOutstanding === 0 && totalOutstanding > 0) {
      percentChange = 100; // went from 0 to something
    } else if (lastMonthOutstanding === 0 && totalOutstanding === 0) {
      percentChange = 0;
    } else {
      percentChange = ((totalOutstanding - lastMonthOutstanding) / lastMonthOutstanding) * 100;
    }

    const result = {
      totalOutstanding: Number(totalOutstanding.toFixed(2)),
      lastMonthOutstanding: Number(lastMonthOutstanding.toFixed(2)),
      outstandingChangePercent: Number(percentChange.toFixed(2))
    };

    if (returnData) return result;
    res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching total outstanding comparison:", error);
    if (returnData) throw error;
    res.status(500).json({ message: "Server error" });
  }
};

// operations repair status
const getRepairStatusCounts = async (req, res, returnData = false) => {
  const { signup_id } = req.user; // from JWT auth

  try {
    const [rows] = await db.query(
      `
      SELECT s.status,
             COUNT(r.repair_id) AS status_count
      FROM (
          SELECT 'Pending' AS status
          UNION ALL
          SELECT 'In Progress'
          UNION ALL
          SELECT 'Completed'
          UNION ALL
          SELECT 'Delivered'
      ) s
      LEFT JOIN repairs r 
        ON r.repair_status = s.status 
       AND r.signup_id = ?
      GROUP BY s.status
      ORDER BY FIELD(s.status, 'Pending','In Progress','Completed','Delivered')
      `,
      [signup_id]
    );

    const result = { repairStatusCounts: rows };

    if (returnData) return result;
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching repair status counts:", error);
    if (returnData) throw error;
    res.status(500).json({ message: "Server error" });
  }
};

// Todays Invoice
const getTodaysInvoices = async (req, res, returnData = false) => {
  const { signup_id } = req.user;

  try {
    const [invoices] = await db.query(
      `
      SELECT 
        i.invoice_id,
        i.invoice_no,
        i.invoice_date,
        c.customer_name, 
        i.status,
        i.subtotal,
        i.grand_total,
        i.amount_paid,
        i.amount_due,
        i.created_date,
        i.created_time
      FROM invoices i
      JOIN customers c ON i.customer_id = c.customer_id
      WHERE i.signup_id = ?
        AND i.invoice_date = CURDATE()
      ORDER BY i.created_date DESC, i.created_time DESC
      `,
      [signup_id]
    );

    const result = {
      count: invoices.length,
      data: invoices
    };

    if (returnData) return result;   // return data to caller
    res.status(200).json(result);    // otherwise send JSON response
  } catch (error) {
    console.error("Error fetching today's invoices:", error);
    if (returnData) throw error;
    res.status(500).json({ message: "Server error" });
  }
};


//                            This are the clicable links from the dashboard

// outstanding invoice list
const getOutstandingInvoices = async (req, res) => {
  const { signup_id } = req.user;

  try {
    const [invoices] = await db.query(
      `
      SELECT 
        i.invoice_id,
        i.invoice_no,
        i.invoice_date,
        c.customer_name,
        i.status,
        i.subtotal,
        i.grand_total,
        i.amount_paid,
        i.amount_due,
        i.created_date,
        i.created_time
      FROM invoices i
      JOIN customers c 
        ON i.customer_id = c.customer_id
      WHERE i.signup_id = ?
        AND i.status IN ('ISSUED', 'PARTIALLY_PAID')
      ORDER BY i.invoice_date DESC
      `,
      [signup_id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No outstanding invoices found" });
    }

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching outstanding invoices:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// filtered status according to user click
const getRepairsByStatus = async (req, res) => {
  const { signup_id } = req.user;
  const { status } = req.params; // e.g., Pending, In Progress, Completed, Delivered

  try {
    const [repairs] = await db.query(
      `
      SELECT 
        r.repair_id,
        r.repair_no,
        r.repair_status,
        r.created_date,
        r.created_time,
        c.customer_name,
        t.technician_name,
        GROUP_CONCAT(CONCAT(ii.product_name, ' (', ii.problem_description, ')') SEPARATOR '; ') AS products_with_problems
      FROM repairs r
      JOIN customers c ON r.customer_id = c.customer_id
      LEFT JOIN technicians t ON r.technician_id = t.technician_id
      LEFT JOIN inquiry_items ii ON r.inquiry_id = ii.inquiry_id
      WHERE r.signup_id = ?
        AND r.repair_status = ?
      GROUP BY r.repair_id
      ORDER BY r.created_date DESC, r.created_time DESC
      `,
      [signup_id, status]
    );

    if (repairs.length === 0) {
      return res.status(400).json({ message: `No ${status} repairs found.` });
    }

    res.status(200).json({ repairs });

  } catch (error) {
    console.error("Error fetching repairs by status:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};





module.exports = { getRevenue, getSixMonthRevenue, getOutstandingTotal,getTodaysInvoices, getOutstandingInvoices,getRepairStatusCounts, getRepairsByStatus };
