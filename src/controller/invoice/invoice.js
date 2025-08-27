const { checkCustomer, createCustomer } = require("../../utils/getOrCreateCustomer");
const db = require("../../db/database");



const createInvoice = async (req, res) => {
  const {
    source_type,        // DIRECT, QUOTATION, REPAIR
    source_id,          // quotation_id / repair_id
    invoice_date,
    ship_to_name,
    ship_to_address,
    notes_public,
    notes_internal,
    items,              // only for DIRECT invoices
    customer_name,
    customer_contact,
    customer_email,
    customer_address
  } = req.body;

  const { signup_id } = req.user;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let customer_id;
    let bill_to_name;
    let bill_to_address;
    let invoice_items = [];

    // 1️⃣ Handle Customer & Source
    if (source_type === "DIRECT") {
      if (!items || items.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "Items are required for DIRECT invoice" });
      }

      let customer = await checkCustomer(connection, signup_id, customer_contact);
      if (!customer) {
        customer = await createCustomer(connection, signup_id, {
          customer_name,
          customer_contact,
          customer_email,
          customer_address,
        });
      }

      customer_id = customer.customer_id;
      bill_to_name = customer.customer_name;
      bill_to_address = customer.customer_address || "NA";
      invoice_items = items;
    }

    else if (source_type === "QUOTATION") {
      const [quotations] = await connection.query(
        `SELECT q.*, c.customer_name, c.customer_address, q.status
         FROM quotation q
         JOIN customers c ON q.customer_id = c.customer_id
         WHERE q.quotation_id=? AND q.signup_id=?`,
        [source_id, signup_id]
      );

      if (!quotations.length) {
        await connection.rollback();
        return res.status(404).json({ error: "Quotation not found" });
      }

      const quotation = quotations[0];
      if (quotation.status !== "ACCEPTED") {
        await connection.rollback();
        return res.status(400).json({ error: "Cannot create invoice. Quotation is not accepted." });
      }

      customer_id = quotation.customer_id;
      bill_to_name = quotation.customer_name;
      bill_to_address = quotation.customer_address || "NA";

      const [qItems] = await connection.query(
        `SELECT * FROM quotation_items WHERE quotation_id=?`,
        [source_id]
      );
      invoice_items = qItems;
    }

    else if (source_type === "REPAIR") {
      const [repairs] = await connection.query(
        `SELECT * FROM repair WHERE repair_id=? AND signup_id=?`,
        [source_id, signup_id]
      );
      if (!repairs.length) {
        await connection.rollback();
        return res.status(404).json({ error: "Repair not found" });
      }

      const repair = repairs[0];
      if (!repair.quotation_id) {
        await connection.rollback();
        return res.status(400).json({ error: "Repair does not have linked quotation" });
      }

      const [quotations] = await connection.query(
        `SELECT q.*, c.customer_name, c.customer_address, q.status
         FROM quotation q
         JOIN customers c ON q.customer_id = c.customer_id
         WHERE q.quotation_id=? AND q.signup_id=?`,
        [repair.quotation_id, signup_id]
      );

      if (!quotations.length) {
        await connection.rollback();
        return res.status(404).json({ error: "Linked quotation not found" });
      }

      const quotation = quotations[0];
      if (quotation.status !== "ACCEPTED") {
        await connection.rollback();
        return res.status(400).json({ error: "Cannot create invoice. Quotation is not accepted." });
      }

      customer_id = quotation.customer_id;
      bill_to_name = quotation.customer_name;
      bill_to_address = quotation.customer_address || "NA";

      const [qItems] = await connection.query(
        `SELECT * FROM quotation_items WHERE quotation_id=?`,
        [repair.quotation_id]
      );
      invoice_items = qItems;
    }

    else {
      await connection.rollback();
      return res.status(400).json({ error: "Invalid source_type" });
    }

    // 2️⃣ Generate Invoice Serial & Number
    const now = new Date();
    const month = now.toLocaleString("default", { month: "short" }).toUpperCase();
    const year = now.getFullYear().toString().slice(-2);

    const [latest] = await connection.query(
      "SELECT MAX(invoice_serial) AS max_serial FROM invoices WHERE signup_id=?",
      [signup_id]
    );
    const nextSerial = (latest[0].max_serial || 0) + 1;

    const invoice_no = `INV${String(nextSerial).padStart(3, "0")}/${month}/${year}`;

    // 3️⃣ Calculate Totals
    const subtotal = invoice_items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price),
      0
    );
    const grand_total = subtotal;
    const amount_paid = 0;
    const amount_due = grand_total;

    // 4️⃣ Insert Invoice
    const [invoiceResult] = await connection.query(
      `INSERT INTO invoices (
        signup_id, invoice_serial, invoice_no, invoice_date, customer_id,
        bill_to_name, bill_to_address, ship_to_name, ship_to_address,
        source_type, source_id, status,
        subtotal, grand_total, amount_paid, amount_due,
        notes_public, notes_internal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        signup_id,
        nextSerial,
        invoice_no,
        invoice_date || now.toISOString().split("T")[0],
        customer_id,
        bill_to_name,
        bill_to_address,
        ship_to_name || null,
        ship_to_address || null,
        source_type,
        source_id || null,
        "DRAFT",
        subtotal,
        grand_total,
        amount_paid,
        amount_due,
        notes_public || "NA",
        notes_internal || "NA",
      ]
    );

    const invoice_id = invoiceResult.insertId;

    // 5️⃣ Insert Invoice Items
    const itemInsertData = invoice_items.map((item) => [
      invoice_id,
      item.product_name,
      item.product_category_id || null,
      item.product_description || "",
      item.warranty || "",
      item.quantity,
      item.unit_price,
      null, // supplier_id placeholder
      null, // cost_price placeholder
    ]);

    if (itemInsertData.length) {
      await connection.query(
        `INSERT INTO invoice_items (
          invoice_id, product_name, product_category_id, product_description, warranty,
          quantity, unit_price, supplier_id, cost_price
        ) VALUES ?`,
        [itemInsertData]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice_id,
      invoice_no,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating invoice:", error.message);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
};



module.exports = { createInvoice };