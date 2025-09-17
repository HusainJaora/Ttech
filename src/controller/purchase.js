const db = require("../db/database");

const addPurchasePrice = async (req, res) => {
    const { invoice_id } = req.params;
    const { items } = req.body; 
    const { signup_id } = req.user;
  
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // check invoice ownership
      const [checkInvoice] = await connection.query(
        `SELECT invoice_id 
         FROM invoices 
         WHERE invoice_id = ? AND signup_id = ?`,
        [invoice_id, signup_id]
      );
  
      if (checkInvoice.length === 0) {
        return res.status(404).json({ message: "Invoice not found or access denied" });
      }
  
      let updatedCount = 0;
  
      for (const item of items) {
        const [result] = await connection.query(
          `UPDATE invoice_items
           SET supplier_id = ?, cost_price = ?
           WHERE invoice_item_id = ? AND invoice_id = ?`,
          [
            item.supplier_id ?? null,  // use ?? so undefined turns into null
            item.cost_price ?? null,
            item.invoice_item_id,
            invoice_id
          ]
        );
  
        updatedCount += result.affectedRows;
      }
  
      await connection.commit();
  
      res.status(200).json({
        message: "Update complete",
        updated_items: updatedCount
      });
  
    } catch (error) {
      await connection.rollback();
      console.error("Error bulk updating invoice items:", error);
      res.status(500).json({ message: "Server error", error });
    } finally {
      connection.release();
    }
};


const updatePurchasePrice = async (req, res) => {
  const { invoice_id } = req.params;
  const { items } = req.body; // [{ invoice_item_id, supplier_id, cost_price }, ...]
  const { signup_id } = req.user;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items must be a non-empty array" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // quick ownership verify (optional but helpful early fail)
    const [checkInvoice] = await connection.query(
      `SELECT invoice_id FROM invoices WHERE invoice_id = ? AND signup_id = ?`,
      [invoice_id, signup_id]
    );
    if (checkInvoice.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Invoice not found or access denied" });
    }

    let updatedCount = 0;

    for (const item of items) {
      const [result] = await connection.query(
        `UPDATE invoice_items ii
         JOIN invoices i ON ii.invoice_id = i.invoice_id AND i.signup_id = ?
         SET ii.supplier_id = ?, ii.cost_price = ?
         WHERE ii.invoice_item_id = ? AND ii.invoice_id = ?`,
        [
          signup_id,
          item.supplier_id ?? null,
          item.cost_price ?? null,
          item.invoice_item_id,
          invoice_id
        ]
      );

      updatedCount += result.affectedRows;
    }

    await connection.commit();
    return res.status(200).json({
      message: "Update complete",
      updated_items: updatedCount
    });

  } catch (error) {
    await connection.rollback();
    console.error("Error bulk updating invoice items:", error);
    return res.status(500).json({ message: "Server error", error });
  } finally {
    connection.release();
  }
};

const deletePurchasePrice = async (req, res) => {
  const { invoice_item_id } = req.params;
  const { signup_id } = req.user;

  const connection = await db.getConnection();
  try {
    // make sure item belongs to this user (through invoice)
    const [check] = await connection.query(
      `SELECT ii.invoice_item_id
       FROM invoice_items ii
       JOIN invoices i ON ii.invoice_id = i.invoice_id
       WHERE ii.invoice_item_id = ? AND i.signup_id = ?`,
      [invoice_item_id, signup_id]
    );

    if (check.length === 0) {
      return res
        .status(404)
        .json({ message: "Invoice item not found or access denied" });
    }

    // set supplier_id and cost_price back to NULL
    const [result] = await connection.query(
      `UPDATE invoice_items
       SET supplier_id = NULL, cost_price = NULL
       WHERE invoice_item_id = ?`,
      [invoice_item_id]
    );

    res.status(200).json({
      message: "Supplier and cost price removed",
      updated: result.affectedRows
    });
  } catch (error) {
    console.error("Error removing supplier/cost price:", error);
    res.status(500).json({ message: "Server error", error });
  } finally {
    connection.release();
  }
};



const getAllPurchases = async (req, res) => {
  const { signup_id } = req.user;
  const { supplier_id, start_date, end_date, search } = req.query;

  const connection = await db.getConnection();
  try {
    let query = `
      SELECT 
        i.invoice_no,
        i.invoice_date,
        ii.product_name,
        ii.quantity,
        ii.cost_price,
        (ii.quantity * ii.cost_price) AS total_cost,
        s.supplier_Legal_name
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.invoice_id
      LEFT JOIN suppliers s ON ii.supplier_id = s.supplier_id
      WHERE i.signup_id = ?
    `;
    const params = [signup_id];

    if (supplier_id) {
      query += ` AND ii.supplier_id = ?`;
      params.push(supplier_id);
    }
    if (start_date && end_date) {
      query += ` AND i.invoice_date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }
    if (search) {
      query += ` AND (i.invoice_no LIKE ? OR s.supplier_Legal_name LIKE ? OR ii.product_name LIKE ?)`;
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    query += ` ORDER BY i.invoice_date DESC`;

    const [rows] = await connection.query(query, params);

    res.status(200).json({
      purchases: rows,
      count: rows.length
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: "Server error", error });
  } finally {
    connection.release();
  }
};


module.exports = {
    addPurchasePrice,
    updatePurchasePrice,
    deletePurchasePrice,
    getAllPurchases
}