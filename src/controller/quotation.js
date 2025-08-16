const db = require("../db/database");
const { createCustomer } = require("../utils/getOrCreateCustomer");

const addQuotation = async (req, res) => {
  const {
    customer_name,
    customer_contact,
    customer_email = "NA",
    customer_address = "NA",
    notes,
    items
  } = req.body
  const { signup_id } = req.user;


  const connection = await db.getConnection();
  try {

    await connection.beginTransaction();

    const [existingCustomer] = await connection.query(
      `SELECT customer_id FROM customers 
       WHERE signup_id=? AND customer_contact=? 
       LIMIT 1`,
      [signup_id, customer_contact]
    );
    let customer_id;
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

    // Genrate quotation number
    const now = new Date();
    const month = now.toLocaleString("default", { month: "short" }).toUpperCase();
    const year = now.getFullYear().toString().slice(-2);
    const [latest] = await connection.query(
      "SELECT MAX(quotation_serial) AS max_serial FROM quotation WHERE signup_id=?", [signup_id]
    );
    const nextSerial = (latest[0].max_serial || 0) + 1;
    const quotation_no = `Q00${nextSerial}/${month}/${year}`;

    // calculate total amount
    const total_amount = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price)
    }, 0);

    // Insert into quotation table
    const [quotationResult] = await connection.query(
      `INSERT INTO quotation (
            signup_id,customer_id, quotation_serial, quotation_no,
            total_amount, notes
          ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        signup_id,
        customer_id,
        nextSerial,
        quotation_no,
        total_amount,
        notes
      ]
    );

    const quotation_id = quotationResult.insertId;
    // Insert into quotation_items table
    const itemInsertData = items.map(item => [
      quotation_id,
      item.product_name,
      item.product_category_id,
      item.product_description || '',
      item.quantity,
      item.unit_price,
    ]);
    await connection.query(
      `INSERT INTO quotation_items (
            quotation_id, product_name,product_category_id, product_description,
            quantity, unit_price
          ) VALUES ?`,
      [itemInsertData]
    );
    await connection.commit();
    res.status(201).json({
      message: "Quotation created successfully",
      quotation_id,
      quotation_no
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating quotation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    connection.release();
  }
}


const updateQuotation = async (req, res) => {
  const { quotation_id } = req.params;
  const {
    notes,
    items,             // optional: add/update items
    deleted_item_ids   // optional: delete items
  } = req.body;

  const { signup_id } = req.user;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Update notes only if provided
    if (notes !== undefined) {
      const [updateResult] = await connection.query(
        `UPDATE quotation 
         SET notes = ? 
         WHERE quotation_id = ? AND signup_id = ?`,
        [notes, quotation_id, signup_id]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Quotation not found or unauthorized" });
      }
    }

    // 2. Add/Update items
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.item_id) {
          // Update existing item
          await connection.query(
            `UPDATE quotation_items SET 
              product_name = ?,
              product_category_id = ?,
              product_description = ?, 
              quantity = ?, 
              unit_price = ?
             WHERE item_id = ? AND quotation_id = ?`,
            [
              item.product_name,
              item.product_category_id,
              item.product_description || '',
              item.quantity,
              item.unit_price,
              item.item_id,
              quotation_id
            ]
          );
        } else {
          // Insert new item
          await connection.query(
            `INSERT INTO quotation_items (
              quotation_id, product_name,product_category_id, product_description,
              quantity, unit_price
            ) VALUES (?, ?, ?, ?, ?,?)`,
            [
              quotation_id,
              item.product_name,
              item.product_category_id,
              item.product_description || '',
              item.quantity,
              item.unit_price
            ]
          );
        }
      }
    }

    // 3. Delete items
    if (deleted_item_ids && deleted_item_ids.length > 0) {
      await connection.query(
        `DELETE FROM quotation_items 
         WHERE item_id IN (?) AND quotation_id = ?`,
        [deleted_item_ids, quotation_id]
      );
    }

    // 4. Recalculate total_amount
    const [[{ sum }]] = await connection.query(
      `SELECT SUM(quantity * unit_price) AS sum 
       FROM quotation_items 
       WHERE quotation_id = ?`,
      [quotation_id]
    );

    await connection.query(
      `UPDATE quotation 
       SET total_amount = ? 
       WHERE quotation_id = ?`,
      [sum || 0, quotation_id]
    );

    await connection.commit();
    res.status(200).json({ message: "Quotation updated successfully" });

  } catch (error) {
    await connection.rollback();
    console.error("Error updating quotation:", error);
    res.status(500).json({ error: "Internal Server Error" });
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

module.exports = { addQuotation, updateQuotation, deleteQuotation };