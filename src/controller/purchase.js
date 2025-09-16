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

module.exports = {
    addPurchasePrice
}