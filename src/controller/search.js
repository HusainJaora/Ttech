const db = require("../db/database");

//                      Master 
const searchSuppliers = async (req, res) => {
  const { q } = req.query; // search term
  const { signup_id } = req.user;

  try {
    let query = `
      SELECT supplier_id, supplier_Legal_name, created_date, created_time
      FROM suppliers
      WHERE signup_id = ?
    `;
    const params = [signup_id];

    // 🔎 Add search only if q is provided
    if (q) {
      query += `
        AND (
          supplier_Legal_name LIKE ? 
          OR supplier_Ledger_name LIKE ? 
          OR supplier_contact LIKE ? 
          OR supplier_contact_name LIKE ?
        )
      `;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    // Order latest first (same as getAllSuppliers)
    query += ` ORDER BY supplier_id DESC`;

    const [suppliers] = await db.query(query, params);

    if (suppliers.length === 0) {
      return res.status(200).json({ message: "No suppliers found." });
    }

    res.status(200).json({ suppliers });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const searchTechnicians = async (req, res) => {
    const { q } = req.query;
    const {signup_id} = req.user;
  
    try {
      const [technicians] = await db.query(
        `SELECT technician_id, technician_name, technician_phone
         FROM technicians
         WHERE signup_id = ?
         AND (
            technician_name LIKE ? 
            OR technician_phone LIKE ?
         )`,
        [signup_id, `%${q}%`, `%${q}%`]
      );
  
      res.status(200).json(technicians);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

const searchProductCategories = async (req, res) => {
    const { q } = req.query;
    const { signup_id } = req.user;
  
    try {
      let query = `
        SELECT product_category_id, product_category_name, created_date, created_time
        FROM product_categories
        WHERE signup_id = ?
      `;
      const params = [signup_id];
  
      // 🔎 Apply search only if q is provided
      if (q) {
        query += ` AND product_category_name LIKE ?`;
        params.push(`%${q}%`);
      }
  
      // Keep same ordering as getAllProductCategory
      query += ` ORDER BY product_category_id DESC`;
  
      const [categories] = await db.query(query, params);
  
      if (categories.length === 0) {
        return res.status(200).json({ message: "No product category found." });
      }
  
      res.status(200).json({ ProductCategory: categories });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

//                     Invioce with date filter
const searchInvoices = async (req, res) => {
  const { q, from_date, to_date } = req.query; // q = search term, optional date filters
  const { signup_id } = req.user;

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

    // 🔎 Keyword search (invoice no, customer name)
    if (q) {
      query += ` 
        AND (i.invoice_no LIKE ? 
        OR c.customer_name LIKE ? 
        OR c.customer_contact LIKE ?)
      `;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    // 📅 Date range filter
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

    // 🕒 Order by latest invoice
    query += ` ORDER BY i.invoice_date DESC, i.invoice_id DESC`;

    const [invoices] = await db.query(query, params);

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }

    res.status(200).json({ invoices });

  } catch (error) {
    console.error("Error searching invoices:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


//                     Quotation with date filter
const searchQuotations = async (req, res) => {
  const { q, from_date, to_date } = req.query; // q = keyword
  const { signup_id } = req.user;

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

    // 🔎 Keyword search
    if (q) {
      query += ` 
        AND (
          q.quotation_no LIKE ? 
          OR c.customer_name LIKE ? 
          OR c.customer_contact LIKE ?
        )
      `;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    // 📅 Date range filter
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

    // 🕒 Order latest first
    query += ` ORDER BY q.quotation_date DESC, q.quotation_time DESC`;

    const [quotations] = await db.query(query, params);

    if (quotations.length === 0) {
      return res.status(404).json({ message: "No quotation found" });
    }

    res.status(200).json({
      total: quotations.length,
      quotations
    });

  } catch (error) {
    console.error("Error searching quotations:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


//                    Inquiries with date filter
const searchInquiries = async (req, res) => {
  const { q, from_date, to_date } = req.query;
  const { signup_id } = req.user;

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

    // 🔎 Search filter
    if (q) {
      query += ` AND (i.inquiry_no LIKE ? OR c.customer_name LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    // 📅 Date filter
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

    if (inquiries.length === 0) {
      return res.status(200).json({ message: "No inquiries found." });
    }

    res.status(200).json({ total: inquiries.length, inquiries });

  } catch (error) {
    console.error("Error searching inquiries:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//                   Repairs with date filter
const searchRepairs = async (req, res) => {
    const { q, from_date, to_date } = req.query;
    const { signup_id } = req.user;
  
    try {
      let query = `
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
      `;
  
      const params = [signup_id];
  
      // 🔎 Keyword search
      if (q) {
        query += ` AND (
          r.repair_no LIKE ? 
          OR c.customer_name LIKE ? 
          OR t.technician_name LIKE ? 
          OR ii.product_name LIKE ? 
          OR ii.problem_description LIKE ?
        )`;
        params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
      }
  
      // 📅 Date range filter
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
  
      // Grouping (to match getAllRepair)
      query += `
        GROUP BY r.repair_id
        ORDER BY r.created_date DESC, r.created_time DESC
      `;
  
      const [repairs] = await db.query(query, params);
  
      if (repairs.length === 0) {
        return res.status(404).json({ message: "No repairs found" });
      }
  
      res.status(200).json(repairs);
    } catch (error) {
      console.error("Error searching repairs:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
};

//                   Customers no date filter
const searchCustomers = async (req, res) => {
  const { q } = req.query;
  const { signup_id } = req.user;

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

    // 🔎 Keyword search (by name or contact)
    if (q) {
      query += ` AND (
        customer_name LIKE ? 
        OR customer_contact LIKE ?
      )`;
      params.push(`%${q}%`, `%${q}%`);
    }

    query += ` ORDER BY customer_id DESC`;

    const [customers] = await db.query(query, params);

    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }

    res.status(200).json({ customers });
  } catch (error) {
    console.error("Error searching customers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
    searchSuppliers,
    searchTechnicians,
    searchProductCategories,
    searchInvoices,
    searchQuotations,
    searchInquiries,
    searchRepairs,
    searchCustomers
}
  
  
  

  