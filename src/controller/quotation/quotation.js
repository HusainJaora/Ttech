const db = require("../../db/database");
const { createCustomer } = require("../../utils/getOrCreateCustomer");

const addQuotation = async (req, res) => {
  const {
    customer_name,
    customer_contact,
    customer_email = "NA",
    customer_address = "NA",
    inquiry_id,// optional, only for Repair quotations
    notes,
    items,

  } = req.body;

  const { signup_id } = req.user;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let customer_id;
    let quotation_type = "Normal";

    // 🔹 If inquiry_id is passed → Repair quotation
    if (inquiry_id) {
      quotation_type = "Repair";

      // check inquiry exists & is Done
      const [inquiry] = await connection.query(
        `SELECT inquiry_id, status, customer_id 
         FROM inquires 
         WHERE inquiry_id=? AND signup_id=?`,
        [inquiry_id, signup_id]
      );

      if (inquiry.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Inquiry not found" });
      }
      if (inquiry[0].status !== "Done") {
        await connection.rollback();
        return res.status(400).json({ error: "Repair quotation can only be created for inquiries marked as Done" });
      }

      // use inquiry’s customer_id automatically
      customer_id = inquiry[0].customer_id;
    } else {
      // 🔹 Normal quotation → find or create customer
      const [existingCustomer] = await connection.query(
        `SELECT customer_id FROM customers 
         WHERE signup_id=? AND customer_contact=? 
         LIMIT 1`,
        [signup_id, customer_contact]
      );

      if (existingCustomer.length > 0) {
        customer_id = existingCustomer[0].customer_id;
      } else {
        const newCustomer = await createCustomer(connection, signup_id, {
          customer_name,
          customer_contact,
          customer_email,
          customer_address
        });
        customer_id = newCustomer.customer_id;
      }
    }

    // 🔹 Generate quotation serial & number
    const now = new Date();
    const month = now.toLocaleString("default", { month: "short" }).toUpperCase();
    const year = now.getFullYear().toString().slice(-2);

    const [latest] = await connection.query(
      "SELECT MAX(quotation_serial) AS max_serial FROM quotation WHERE signup_id=?",
      [signup_id]
    );
    const nextSerial = (latest[0].max_serial || 0) + 1;


    const prefix = quotation_type === "Repair" ? "RQ" : "Q";
    const quotation_no = `${prefix}${String(nextSerial).padStart(3, "0")}/${month}/${year}`;


    // 🔹 Calculate total
    const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // 🔹 Insert quotation
    const [quotationResult] = await connection.query(
      `INSERT INTO quotation (
        signup_id, customer_id, quotation_serial, quotation_no,
        quotation_type, total_amount, notes, inquiry_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        signup_id,
        customer_id,
        nextSerial,
        quotation_no,
        quotation_type,
        total_amount,
        notes,
        inquiry_id || null
      ]
    );

    const quotation_id = quotationResult.insertId;

    // 🔹 Insert quotation items
    const itemInsertData = items.map(item => [
      quotation_id,
      item.product_name,
      item.product_category_id,
      item.product_description || '',
      item.warranty,
      item.quantity,
      item.unit_price,
    ]);

    await connection.query(
      `INSERT INTO quotation_items (
        quotation_id, product_name, product_category_id, product_description,warranty,
        quantity, unit_price
      ) VALUES ?`,
      [itemInsertData]
    );

    await connection.commit();
    res.status(201).json({
      message: `${quotation_type} quotation created successfully`,
      quotation_id,
      quotation_no,
    });

  } catch (error) {
    await connection.rollback();
    console.error("Error creating quotation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    connection.release();
  }
};

const updateQuotation = async (req, res) => {
  const { quotation_id } = req.params;
  const { signup_id } = req.user;
  const { notes, items, deleted_item_ids, quotation_type } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Check quotation status
    const [quotationRows] = await connection.query(
      `SELECT * FROM quotation WHERE quotation_id = ? AND signup_id = ?`,
      [quotation_id, signup_id]
    );

    if (!quotationRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: "Quotation not found" });
    }

    const quotation = quotationRows[0];
    const currentStatus = (quotation.status || "").toUpperCase();

    if (!["DRAFT", "REJECTED"].includes(currentStatus)) {
      await connection.rollback();
      return res.status(400).json({
        error: `Quotation cannot be updated in '${quotation.status}' status`
      });
    }

    // 2. Update main quotation fields
    await connection.query(
      `UPDATE quotation 
       SET notes = ?, quotation_type = ? 
       WHERE quotation_id = ? AND signup_id = ?`,
      [notes || "NA", quotation_type || null, quotation_id, signup_id]
    );

    // 3. Handle deleted items
    if (deleted_item_ids?.length) {
      const placeholders = deleted_item_ids.map(() => "?").join(",");
      await connection.query(
        `DELETE FROM quotation_items WHERE item_id IN (${placeholders}) AND quotation_id = ?`,
        [...deleted_item_ids, quotation_id]
      );
    }

    // 4. Handle items (update or insert)
    if (items?.length) {
      for (const item of items) {
        if (item.item_id) {
          // Update existing item
          await connection.query(
            `UPDATE quotation_items 
             SET product_name=?, product_category_id=?, product_description=?, warranty=?, quantity=?, unit_price=? 
             WHERE item_id=? AND quotation_id=?`,
            [
              item.product_name,
              item.product_category_id || null,
              item.product_description || null,
              item.warranty || "",
              item.quantity || 0,
              item.unit_price || 0,
              item.item_id,
              quotation_id
            ]
          );
        } else {
          // Insert new item
          await connection.query(
            `INSERT INTO quotation_items 
             (quotation_id, product_name, product_category_id, product_description, warranty, quantity, unit_price) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              quotation_id,
              item.product_name,
              item.product_category_id || null,
              item.product_description || null,
              item.warranty || "",
              item.quantity || 0,
              item.unit_price || 0
            ]
          );
        }
      }
    }

    // 5. Recalculate totals from DB (always, even if only deletes happened)
    const [allItems] = await connection.query(
      `SELECT quantity, unit_price FROM quotation_items WHERE quotation_id=?`,
      [quotation_id]
    );

    const total_amount = allItems.reduce(
      (sum, i) => sum + ((i.quantity || 0) * (i.unit_price || 0)),
      0
    );

    await connection.query(
      `UPDATE quotation SET total_amount=? WHERE quotation_id=? AND signup_id=?`,
      [total_amount, quotation_id, signup_id]
    );

    await connection.commit();
    res.status(200).json({ message: "Quotation updated successfully" });

  } catch (error) {
    await connection.rollback();
    console.error("Error updating quotation:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
};

const deleteQuotation = async (req, res) => {
  const { quotation_id } = req.params;
  const { signup_id } = req.user;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [quotation] = await connection.query(`
      SELECT * FROM quotation WHERE quotation_id=? AND signup_id=?`, [quotation_id, signup_id]);

    if (quotation.length === 0) {
      return res.status(404).json({ error: "Quotation not found or unauthorized" });
    }
    await connection.query(`
      DELETE FROM quotation_items WHERE quotation_id=?`, [quotation_id]);

    await connection.query(`
      DELETE FROM quotation WHERE quotation_id=? AND signup_id=?`, [quotation_id, signup_id]);

    await connection.commit();

    res.status(200).json({ message: "Quotation and its items deleted successfully", quotation_id })

  } catch (error) {
    await connection.rollback();
    console.log(error)
    res.status(500).json({ error: "Internal Server Error" });

  }
  finally {
    connection.release();

  }
}

const getAllQuotation = async (req, res) => {
  const { signup_id } = req.user;

  try {

    const [quotations] = await db.query(`
      SELECT q.quotation_id, q.quotation_no, c.customer_name, q.total_amount,q.status,
      q.quotation_date, q.quotation_time
      FROM quotation q
      JOIN customers c ON q.customer_id = c.customer_id
      WHERE q.signup_id=?
      ORDER BY q.quotation_date DESC, q.quotation_time DESC
      `, [signup_id]);

    if (quotations.length === 0) {
      return res.status(404).json({ message: "No quotation found" });
    }
    res.status(200).json({
      total: quotations.length,
      quotations
    })

  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }


}

const getSingleQuotation = async (req, res) => {
  const { quotation_id } = req.params;
  const { signup_id } = req.user;

  const connection = await db.getConnection();
  try {
    // 🔹 1. Get quotation + customer info
    const [quotationRows] = await connection.query(
      `SELECT 
          q.quotation_id,
          q.quotation_no,
          q.quotation_serial,
          q.quotation_type,
          q.total_amount,
          q.notes,
          q.quotation_date,
          q.quotation_time,
          q.inquiry_id,
          c.customer_id,
          c.customer_name,
          c.customer_contact,
          c.customer_email,
          c.customer_address
       FROM quotation q
       JOIN customers c ON q.customer_id = c.customer_id
       WHERE q.quotation_id = ? AND q.signup_id = ?`,
      [quotation_id, signup_id]
    );

    if (quotationRows.length === 0) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    const quotation = quotationRows[0];

    // 🔹 2. Get quotation items
    const [items] = await connection.query(
      `SELECT 
          item_id,
          product_name,
          product_category_id,
          product_description,
          warranty,
          quantity,
          unit_price,
          (quantity * unit_price) AS line_total
       FROM quotation_items
       WHERE quotation_id = ?`,
      [quotation_id]
    );

    // 🔹 3. If Repair → get linked inquiry
    let inquiry = null;
    if (quotation.inquiry_id) {
      const [inq] = await connection.query(
        `SELECT inquiry_id, inquiry_no, status
         FROM inquires
         WHERE inquiry_id = ? AND signup_id = ?`,
        [quotation.inquiry_id, signup_id]
      );
      inquiry = inq.length > 0 ? inq[0] : null;
    }

    // 🔹 4. If Invoice exists → get invoice
    const [invoiceRows] = await connection.query(
      `SELECT invoice_id, invoice_no, grand_total, invoice_date, status
       FROM invoices
       WHERE source_type='QUOTATION' AND source_id = ? AND signup_id = ?`,
      [quotation_id,signup_id]
    );
    const invoice = invoiceRows.length > 0 ? invoiceRows[0] : null;

    // 🔹 5. Final response
    res.status(200).json({
      quotation: {
        quotation_id: quotation.quotation_id,
        quotation_no: quotation.quotation_no,
        quotation_type: quotation.quotation_type,
        quotation_date: quotation.quotation_date,
        quotation_time: quotation.quotation_time,
        total_amount: quotation.total_amount,
        notes: quotation.notes,
        customer: {
          customer_id: quotation.customer_id,
          customer_name: quotation.customer_name,
          customer_contact: quotation.customer_contact,
          customer_email: quotation.customer_email,
          customer_address: quotation.customer_address
        },
        items,
        inquiry,
        invoice
      }
    });

  } catch (error) {
    console.error("Error fetching single quotation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    connection.release();
  }
};


module.exports = { addQuotation, updateQuotation, deleteQuotation, getAllQuotation, getSingleQuotation };