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
    
      try {
        // Genrate quotation number
        const now = new Date();
        const month = now.toLocaleString("default",{month:"short"}).toUpperCase();
        const year = now.getFullYear().toString().slice(-2);
        const [latest] = await db.query(
            "SELECT MAX(quotation_serial) AS max_serial FROM quotation WHERE signup_id=?",[signup_id]
        );
        const nextSerial =(latest[0].max_serial || 0) + 1;
        const quotation_no = `Q${nextSerial}/${month}/${year}`;

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

        res.status(201).json({
          message: "Quotation created successfully",
          quotation_id,
          quotation_no
        });
      } catch (error) {
        console.error("Error creating quotation:", error);
        res.status(500).json({ error: "Internal Server Error" });
        
      }
}

module.exports ={addQuotation};