const db = require("../db/database");
const ExcelJS = require("exceljs");

const exportInvoice = async (req, res) => {
  const { signup_id } = req.user;
  const { q, from_date, to_date } = req.body; // optional filters

  try {
    let query = `
      SELECT 
        i.invoice_id,
        i.invoice_no,
        i.invoice_date,
        i.status,
        i.subtotal,
        i.grand_total,
        i.amount_paid,
        i.amount_due,
        i.source_type,
        i.source_id,
        c.customer_name,
        c.customer_contact
      FROM invoices i
      JOIN customers c ON i.customer_id = c.customer_id
      WHERE i.signup_id = ?
    `;
    const params = [signup_id];

    // Apply search filter if any
    if (q) {
      query += ` AND (i.invoice_no LIKE ? OR c.customer_name LIKE ? OR c.customer_contact LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    // Apply date filter if any
    if (from_date && to_date) {
      query += ` AND i.invoice_date BETWEEN ? AND ?`;
      params.push(from_date, to_date);
    } else if (from_date) {
      query += ` AND i.invoice_date >= ?`;
      params.push(from_date);
    } else if (to_date) {
      query += ` AND i.invoice_date <= ?`;
      params.push(to_date);
    }

    query += ` ORDER BY i.invoice_date DESC, i.invoice_id DESC`;

    const [invoices] = await db.query(query, params);

    if (!invoices.length) return res.status(404).json({ message: "No invoices to export" });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Invoices");

    worksheet.columns = [
      { header: "Invoice ID", key: "invoice_id", width: 15 },
      { header: "Invoice No", key: "invoice_no", width: 20 },
      { header: "Invoice Date", key: "invoice_date", width: 20 },
      { header: "Customer Name", key: "customer_name", width: 25 },
      { header: "Customer Contact", key: "customer_contact", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Subtotal", key: "subtotal", width: 15 },
      { header: "Grand Total", key: "grand_total", width: 15 },
      { header: "Amount Paid", key: "amount_paid", width: 15 },
      { header: "Amount Due", key: "amount_due", width: 15 },
      { header: "Source Type", key: "source_type", width: 15 },
      { header: "Source ID", key: "source_id", width: 15 },
    ];

    invoices.forEach(row => worksheet.addRow(row));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=invoices.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting invoices:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { exportInvoice };
