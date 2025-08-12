const db = require("../db/database");

const addQuotation = async (req, res) => {
    const {
         customer_name,
         customer_contact,
         customer_email,
         notes,
         items
    } = req.body
    const signup_id = req.user.signup_id;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Quotation must include at least one item" });
      }
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        // Genrate quotation number
        const now = new Date();
        const month = now.toLocaleString("default",{month:"short"}).toUpperCase();
        const year = now.getFullYear().toString().slice(-2);
        const [latest] = await db.query(
            "SELECT MAX(quotation_serial) AS max_serial FROM quotation WHERE signup_id=?",[signup_id]
        );
        const nextSerial =(latest[0].max_serial || 0) + 1;
        const quotation_no = `Q00${nextSerial}/${month}/${year}`;

        // calculate total amount
        const total_amount = items.reduce((sum,item)=>{
          return sum +(item.quantity * item.unit_price)
        },0);
          
        // Insert into quotation table
        const [quotationResult] = await db.query(
          `INSERT INTO quotation (
            signup_id, quotation_serial, quotation_no,
            customer_name, customer_contact, customer_email,
            total_amount, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            signup_id,
            nextSerial,
            quotation_no,
            customer_name,
            customer_contact,
            customer_email,
            total_amount,
            notes
          ]
        );

        const quotation_id = quotationResult.insertId;
        // Insert into quotation_items table
        const itemInsertData = items.map(item => [
          quotation_id,
          item.product_name,
          item.product_description || '',
          item.quantity,
          item.unit_price,
          item.brand_id || null,
          item.supplier_id || null
        ]);
        
        await db.query(
          `INSERT INTO quotation_items (
            quotation_id, product_name, product_description,
            quantity, unit_price, brand_id, supplier_id
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
      }finally{
        connection.release();
      }
}

const updateQuotation = async (req, res) => {
  const { quotation_id } = req.params;
  const {
    customer_name,
    customer_contact,
    customer_email,
    notes,
    items,             // optional for adding/updating items
    deleted_item_ids   // optional for deleting items
  } = req.body;

  const signup_id = req.user.signup_id;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();  //Start the transaction
    // If customer info is provided → update quotation table
    if (
      customer_name !== undefined ||
      customer_contact !== undefined ||
      customer_email !== undefined ||
      notes !== undefined ||
      (items && items.length > 0)
    ) {
      // If items are sent → recalculate total_amount, else skip
      let total_amount = undefined;
      if (items && items.length > 0) {
        total_amount = items.reduce((sum, item) => {
          return sum + (item.quantity * item.unit_price);
        }, 0);
      }

      // Build dynamic query based on provided fields
      let fields = [];
      let values = [];

      if (customer_name !== undefined) {
        fields.push("customer_name = ?");
        values.push(customer_name);
      }
      if (customer_contact !== undefined) {
        fields.push("customer_contact = ?");
        values.push(customer_contact);
      }
      if (customer_email !== undefined) {
        fields.push("customer_email = ?");
        values.push(customer_email);
      }
      if (notes !== undefined) {
        fields.push("notes = ?");
        values.push(notes);
      }
      if (total_amount !== undefined) {
        fields.push("total_amount = ?");
        values.push(total_amount);
      }

      if (fields.length > 0) {
        values.push(quotation_id, signup_id);
        const [updateResult] = await db.query(
          `UPDATE quotation SET ${fields.join(", ")} WHERE quotation_id = ? AND signup_id = ?`,
          values
        );

        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ error: "Quotation not found or unauthorized" });
        }
      }
    }

    // If items are provided → add/update them
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.item_id) {
          // Update existing item
          await db.query(
            `UPDATE quotation_items SET 
              product_name = ?, 
              product_description = ?, 
              quantity = ?, 
              unit_price = ?, 
              brand_id = ?, 
              supplier_id = ?
            WHERE item_id = ? AND quotation_id = ?`,
            [
              item.product_name,
              item.product_description || '',
              item.quantity,
              item.unit_price,
              item.brand_id || null,
              item.supplier_id || null,
              item.item_id,
              quotation_id
            ]
          );
        } else {
          // Insert new item
          await db.query(
            `INSERT INTO quotation_items (
              quotation_id, product_name, product_description,
              quantity, unit_price, brand_id, supplier_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              quotation_id,
              item.product_name,
              item.product_description || '',
              item.quantity,
              item.unit_price,
              item.brand_id || null,
              item.supplier_id || null
            ]
          );
        }
      }
    }

    // If there are deleted_item_ids → delete them
    if (deleted_item_ids && deleted_item_ids.length > 0) {
       await db.query(
        `DELETE FROM quotation_items 
         WHERE item_id IN (?) AND quotation_id = ?`,
        [deleted_item_ids, quotation_id]
      )
    }
    const [[{ sum }]] = await db.query(
      `SELECT SUM(quantity * unit_price) AS sum 
       FROM quotation_items 
       WHERE quotation_id = ?`,
      [quotation_id]
    );
    
    await db.query(
      `UPDATE quotation SET total_amount = ? WHERE quotation_id = ?`,
      [sum || 0, quotation_id]
    );

    await connection.commit() // transaction done save the changes to the db
    res.status(200).json({ message: "Quotation updated successfully" });

  } catch (error) {
    await connection.rollback() // transaction did not completed, dont save any changes in db
    console.error("Error updating quotation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }finally{
    connection.release();
  }
};

module.exports ={addQuotation,updateQuotation};