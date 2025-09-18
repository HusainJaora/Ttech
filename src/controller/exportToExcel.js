const db = require("../db/database");
const ExcelJS = require("exceljs");


// Master
const exportSuppliers = async (req, res) => {
  const { signup_id } = req.user;
  const { q, from_date, to_date } = req.body; // optional filters

  try {
    let query = `
      SELECT supplier_id, supplier_Legal_name, created_date, created_time
      FROM suppliers 
      WHERE signup_id = ?
    `;
    const params = [signup_id];

    // Search filter
    if (q) {
      query += ` AND supplier_Legal_name LIKE ?`;
      params.push(`%${q}%`);
    }

    // Date filters
    if (from_date && to_date) {
      query += ` AND created_date BETWEEN ? AND ?`;
      params.push(from_date, to_date);
    } else if (from_date) {
      query += ` AND created_date >= ?`;
      params.push(from_date);
    } else if (to_date) {
      query += ` AND created_date <= ?`;
      params.push(to_date);
    }

    query += ` ORDER BY supplier_id DESC`;

    const [suppliers] = await db.query(query, params);

    if (!suppliers.length) {
      return res.status(404).json({ message: "No suppliers to export." });
    }

    // Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Suppliers");

    // Define columns
    worksheet.columns = [
      { header: "Supplier ID", key: "supplier_id", width: 20 },
      { header: "Supplier Legal Name", key: "supplier_Legal_name", width: 40 },
      { header: "Created Date", key: "created_date", width: 20 },
      { header: "Created Time", key: "created_time", width: 20 },
    ];

    // Add rows
    suppliers.forEach(row => worksheet.addRow(row));

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=suppliers.xlsx"
    );

    // Write Excel file to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting suppliers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const exportTechnician = async (req, res) => {
  const { signup_id } = req.user;
  const { q, from_date, to_date } = req.body; // optional filters

  try {
    let query = `
      SELECT technician_id, technician_name, created_date, created_time
      FROM technicians 
      WHERE signup_id = ?
    `;
    const params = [signup_id];

    // Search filter
    if (q) {
      query += ` AND technician_name LIKE ?`;
      params.push(`%${q}%`);
    }

    // Date filters
    if (from_date && to_date) {
      query += ` AND created_date BETWEEN ? AND ?`;
      params.push(from_date, to_date);
    } else if (from_date) {
      query += ` AND created_date >= ?`;
      params.push(from_date);
    } else if (to_date) {
      query += ` AND created_date <= ?`;
      params.push(to_date);
    }

    query += ` ORDER BY technician_id DESC`;

    const [technicians] = await db.query(query, params);

    if (!technicians.length) {
      return res.status(404).json({ message: "No technicians to export." });
    }

    // Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Technicians");

    // Define columns
    worksheet.columns = [
      { header: "Technician ID", key: "technician_id", width: 20 },
      { header: "Technician Name", key: "technician_name", width: 30 },
      { header: "Created Date", key: "created_date", width: 20 },
      { header: "Created Time", key: "created_time", width: 20 },
    ];

    // Add rows
    technicians.forEach(row => worksheet.addRow(row));

    // Set response headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=technicians.xlsx"
    );

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting technicians:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const exportProductCategory = async (req, res) => {
  const { signup_id } = req.user;
  const { q, from_date, to_date } = req.body; // optional filters

  try {
    let query = `
      SELECT product_category_id, product_category_name, created_date, created_time
      FROM product_categories
      WHERE signup_id = ?
    `;
    const params = [signup_id];

    // Search filter
    if (q) {
      query += ` AND product_category_name LIKE ?`;
      params.push(`%${q}%`);
    }

    // Date filters
    if (from_date && to_date) {
      query += ` AND created_date BETWEEN ? AND ?`;
      params.push(from_date, to_date);
    } else if (from_date) {
      query += ` AND created_date >= ?`;
      params.push(from_date);
    } else if (to_date) {
      query += ` AND created_date <= ?`;
      params.push(to_date);
    }

    query += ` ORDER BY product_category_id DESC`;

    const [ProductCategory] = await db.query(query, params);

    if (!ProductCategory.length) {
      return res.status(404).json({ message: "No product categories to export." });
    }

    // Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Product Categories");

    // Define columns
    worksheet.columns = [
      { header: "Category ID", key: "product_category_id", width: 20 },
      { header: "Category Name", key: "product_category_name", width: 40 },
      { header: "Created Date", key: "created_date", width: 20 },
      { header: "Created Time", key: "created_time", width: 20 },
    ];

    // Add rows
    ProductCategory.forEach(row => worksheet.addRow(row));

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=product_categories.xlsx"
    );

    // Write Excel file to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting product categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Invoices
const exportInvoice = async (req, res) => {
  const { signup_id } = req.user;
  const { q, from_date, to_date } = req.body; // optional filters

  try {
    let query = `
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

    // Excel setup
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Invoices");

    worksheet.columns = [
      { header: "Invoice ID", key: "invoice_id", width: 15 },
      { header: "Invoice No", key: "invoice_no", width: 20 },
      { header: "Invoice Date", key: "invoice_date", width: 20 },
      { header: "Customer Name", key: "customer_name", width: 25 },
      { header: "Status", key: "status", width: 15 },
      { header: "Subtotal", key: "subtotal", width: 15 },
      { header: "Grand Total", key: "grand_total", width: 15 },
      { header: "Amount Paid", key: "amount_paid", width: 15 },
      { header: "Amount Due", key: "amount_due", width: 15 },
      { header: "Created Date", key: "created_date", width: 20 },
      { header: "Created Time", key: "created_time", width: 20 },
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


// Quotation
const exportQuotation = async (req, res) => {
  const { signup_id } = req.user;
  const { q, from_date, to_date } = req.body; // optional filters

  try {
    let query = `
      SELECT 
        q.quotation_id,
        q.quotation_no,
        c.customer_name,
        q.total_amount,
        q.status,
        q.quotation_date,
        q.quotation_time
      FROM quotation q
      JOIN customers c ON q.customer_id = c.customer_id
      WHERE q.signup_id = ?
    `;
    const params = [signup_id];

    // Search filter
    if (q) {
      query += ` AND (q.quotation_no LIKE ? OR c.customer_name LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    // Date filters
    if (from_date && to_date) {
      query += ` AND q.quotation_date BETWEEN ? AND ?`;
      params.push(from_date, to_date);
    } else if (from_date) {
      query += ` AND q.quotation_date >= ?`;
      params.push(from_date);
    } else if (to_date) {
      query += ` AND q.quotation_date <= ?`;
      params.push(to_date);
    }

    query += ` ORDER BY q.quotation_date DESC, q.quotation_time DESC`;

    const [quotations] = await db.query(query, params);

    if (!quotations.length) {
      return res.status(404).json({ message: "No quotations to export." });
    }

    // Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Quotations");

    // Define columns
    worksheet.columns = [
      { header: "Quotation ID", key: "quotation_id", width: 20 },
      { header: "Quotation No", key: "quotation_no", width: 25 },
      { header: "Customer Name", key: "customer_name", width: 30 },
      { header: "Total Amount", key: "total_amount", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Quotation Date", key: "quotation_date", width: 20 },
      { header: "Quotation Time", key: "quotation_time", width: 20 },
    ];

    // Add rows
    quotations.forEach(row => worksheet.addRow(row));

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=quotations.xlsx"
    );

    // Write Excel file to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting quotations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Inquiries
const exportInquiries = async (req, res) => {
  const { signup_id } = req.user;
  const { q, from_date, to_date } = req.body; // optional filters

  try {
    let query = `
      SELECT 
        i.inquiry_id,
        i.inquiry_no,
        c.customer_name,
        i.status,
        COALESCE(t.technician_name, 'Not Assigned') AS technician_name,
        i.notes,
        i.created_date,
        i.created_time
      FROM inquires i
      JOIN customers c ON i.customer_id = c.customer_id
      LEFT JOIN technicians t ON i.technician_id = t.technician_id
      WHERE i.signup_id = ?
    `;
    const params = [signup_id];

    // Search filter
    if (q) {
      query += ` AND (i.inquiry_no LIKE ? OR c.customer_name LIKE ? OR t.technician_name LIKE ? OR i.notes LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    // Date filters
    if (from_date && to_date) {
      query += ` AND i.created_date BETWEEN ? AND ?`;
      params.push(from_date, to_date);
    } else if (from_date) {
      query += ` AND i.created_date >= ?`;
      params.push(from_date);
    } else if (to_date) {
      query += ` AND i.created_date <= ?`;
      params.push(to_date);
    }

    query += ` ORDER BY i.inquiry_id DESC`;

    const [inquiries] = await db.query(query, params);

    if (!inquiries.length) {
      return res.status(404).json({ message: "No inquiries to export." });
    }

    // Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inquiries");

    // Define columns
    worksheet.columns = [
      { header: "Inquiry ID", key: "inquiry_id", width: 15 },
      { header: "Inquiry No", key: "inquiry_no", width: 20 },
      { header: "Customer Name", key: "customer_name", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Technician Name", key: "technician_name", width: 25 },
      { header: "Notes", key: "notes", width: 40 },
      { header: "Created Date", key: "created_date", width: 20 },
      { header: "Created Time", key: "created_time", width: 20 },
    ];

    // Add rows
    inquiries.forEach(row => worksheet.addRow(row));

    // Set response headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inquiries.xlsx"
    );

    // Write Excel file to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting inquiries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Repairs
const exportRepairs = async (req, res) => {
  const { signup_id } = req.user;
  const { q, from_date, to_date } = req.body; // optional filters

  try {
    let query = `
      SELECT 
        r.repair_id, 
        r.repair_no, 
        r.repair_status, 
        r.created_date, 
        r.created_time,
        c.customer_name, 
        COALESCE(t.technician_name, 'Not Assigned') AS technician_name,
        GROUP_CONCAT(CONCAT(ii.product_name, ' (', ii.problem_description, ')') SEPARATOR '; ') AS products_with_problems
      FROM repairs r
      JOIN customers c ON r.customer_id = c.customer_id
      LEFT JOIN technicians t ON r.technician_id = t.technician_id
      LEFT JOIN inquiry_items ii ON r.inquiry_id = ii.inquiry_id
      WHERE r.signup_id = ?
    `;

    const params = [signup_id];

    // 🔍 Search filter
    if (q) {
      query += `
        AND (
          r.repair_no LIKE ? OR 
          c.customer_name LIKE ? OR 
          COALESCE(t.technician_name, '') LIKE ? OR
          ii.product_name LIKE ? OR 
          ii.problem_description LIKE ?
        )`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    // 📅 Date filters
    if (from_date && to_date) {
      query += ` AND r.created_date BETWEEN ? AND ?`;
      params.push(from_date, to_date);
    } else if (from_date) {
      query += ` AND r.created_date >= ?`;
      params.push(from_date);
    } else if (to_date) {
      query += ` AND r.created_date <= ?`;
      params.push(to_date);
    }

    query += `
      GROUP BY r.repair_id
      ORDER BY r.created_date DESC, r.created_time DESC
    `;

    const [repairs] = await db.query(query, params);

    if (!repairs.length) {
      return res.status(404).json({ message: "No repairs to export" });
    }

    // 📊 Excel setup
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Repairs");

    worksheet.columns = [
      { header: "Repair ID", key: "repair_id", width: 15 },
      { header: "Repair No", key: "repair_no", width: 20 },
      { header: "Status", key: "repair_status", width: 20 },
      { header: "Created Date", key: "created_date", width: 20 },
      { header: "Created Time", key: "created_time", width: 20 },
      { header: "Customer Name", key: "customer_name", width: 25 },
      { header: "Technician", key: "technician_name", width: 25 },
      { header: "Products & Problems", key: "products_with_problems", width: 40 },
    ];

    repairs.forEach(row => worksheet.addRow(row));

    // 📥 Send Excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=repairs.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting repairs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// customer
const exportCustomers = async (req, res) => {
  const { signup_id } = req.user;
  const { q, from_date, to_date } = req.body; // optional filters

  try {
    let query = `
      SELECT 
        customer_id, 
        customer_name, 
        customer_contact, 
        created_date, 
        created_time
      FROM customers
      WHERE signup_id = ?
    `;
    const params = [signup_id];

    // 🔍 Search filter
    if (q) {
      query += ` AND (customer_name LIKE ? OR customer_contact LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    // 📅 Date filters
    if (from_date && to_date) {
      query += ` AND created_date BETWEEN ? AND ?`;
      params.push(from_date, to_date);
    } else if (from_date) {
      query += ` AND created_date >= ?`;
      params.push(from_date);
    } else if (to_date) {
      query += ` AND created_date <= ?`;
      params.push(to_date);
    }

    query += ` ORDER BY customer_id DESC`;

    const [customers] = await db.query(query, params);

    if (!customers.length) {
      return res.status(404).json({ message: "No customers to export." });
    }

    // 📊 Excel setup
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Customers");

    worksheet.columns = [
      { header: "Customer ID", key: "customer_id", width: 15 },
      { header: "Customer Name", key: "customer_name", width: 25 },
      { header: "Customer Contact", key: "customer_contact", width: 20 },
      { header: "Created Date", key: "created_date", width: 20 },
      { header: "Created Time", key: "created_time", width: 20 },
    ];

    customers.forEach(row => worksheet.addRow(row));

    // 📥 Send Excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=customers.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { 
  exportSuppliers,
  exportTechnician,
  exportProductCategory,
  exportInvoice,
  exportQuotation,
  exportInquiries,
  exportRepairs,
  exportCustomers
 };
