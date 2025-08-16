const db = require("../../db/database");
const {  createCustomer } = require("../../utils/getOrCreateCustomer");


const addInquiry = async (req, res) => {
    const {
        customer_name,
        customer_contact,
        customer_email = "NA",
        customer_address = "NA",
        notes,
        products

    } = req.body;
    const { signup_id } = req.user;

    const connection = await db.getConnection();

    try {
        if (!customer_contact || !products || products.length === 0) {
            return res.status(400).json({
                error: "Customer contact and at least one product are required"
            });
        }

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
        //  Generate inquiry serial & number
        const now = new Date();
        const month = now.toLocaleString("default", { month: "short" }).toUpperCase();
        const year = now.getFullYear().toString().slice(-2);

        const [latest] = await connection.query(
            "SELECT MAX(inquiry_serial) AS max_serial FROM inquires WHERE signup_id = ?",
            [signup_id]
        );

        const nextSerial = (latest[0].max_serial || 0) + 1;
        const inquiry_no = `INQ0${nextSerial}/${month}/${year}`;

        const [inquiryResult] = await connection.query(
            `INSERT INTO inquires 
             (signup_id, inquiry_serial, inquiry_no, customer_id,notes) 
             VALUES (?, ?, ?, ?, ?)`,
            [signup_id, nextSerial, inquiry_no, customer_id, notes]
        );
        const inquiry_id = inquiryResult.insertId;

        //  Insert all products into inquiry_items
        const itemsData = products.map(items => [
            inquiry_id,
            items.product_name,
            items.problem_description || "NA",
            items.accessories_given || "NA"
        ]);

        await connection.query(
            `INSERT INTO inquiry_items (inquiry_id, product_name, problem_description, accessories_given) 
         VALUES ?`,
            [itemsData]
        );

        await connection.commit();

        return res.status(201).json({
            message: "Inquiry created successfully",
            inquiry_no,
            customer_id,
            inquiry_id
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error creating inquiry:", error);
        res.status(500).json({ error: "Internal Server Error" });

    } finally {
        connection.release();
    }
}

const updateInquiry = async (req, res) => {
    const { inquiry_id } = req.params;
    const {
        notes,                // optional: update notes for inquiry
        items,                // optional: add/update items [{item_id?, product_name, problem_description, accessories_given}]
        deleted_item_ids      // optional: array of inquiry_item IDs to delete
    } = req.body;

    const { signup_id } = req.user;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        //  Check if inquiry exists and belongs to the logged-in user
        const [inquiry] = await connection.query(
            `SELECT inquiry_id, customer_id 
             FROM inquires 
             WHERE inquiry_id = ? AND signup_id = ?`,
            [inquiry_id, signup_id]
        );

        if (inquiry.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Inquiry not found" });
        }

        //  Update notes only (no customer info change allowed)
        if (notes !== undefined) {
            await connection.query(
                `UPDATE inquires 
                 SET notes = ? 
                 WHERE inquiry_id = ? AND signup_id = ?`,
                [notes, inquiry_id, signup_id]
            );
        }

        //  Delete specified items (if any)
        if (deleted_item_ids && deleted_item_ids.length > 0) {
            await connection.query(
                `DELETE FROM inquiry_items 
                 WHERE inquiry_id = ? 
                 AND item_id IN (?)`,
                [inquiry_id, deleted_item_ids]
            );
        }

        //  Add or update items
        if (items && items.length > 0) {
            for (const item of items) {
                if (item.inquiry_item_id) {
                    // Update existing item
                    await connection.query(
                        `UPDATE inquiry_items 
                         SET product_name = ?, 
                             problem_description = ?, 
                             accessories_given = ? 
                         WHERE item_id = ? 
                         AND inquiry_id = ?`,
                        [
                            item.product_name,
                            item.problem_description || "NA",
                            item.accessories_given || "NA",
                            item.inquiry_item_id,
                            inquiry_id
                        ]
                    );
                } else {
                    // Insert new item
                    await connection.query(
                        `INSERT INTO inquiry_items 
                         (inquiry_id, product_name, problem_description, accessories_given) 
                         VALUES (?, ?, ?, ?)`,
                        [
                            inquiry_id,
                            item.product_name,
                            item.problem_description || "NA",
                            item.accessories_given || "NA"
                        ]
                    );
                }
            }
        }

        await connection.commit();

        return res.status(200).json({
            message: "Inquiry updated successfully",
            inquiry_id
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error updating inquiry:", error);
        res.status(500).json({ error: "Internal Server Error" });

    } finally {
        connection.release();
    }
};

const deleteInquiry = async (req, res) => {
    const { inquiry_id } = req.params;
    const { signup_id } = req.user;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      const [inquiry] = await connection.query(`
        SELECT * FROM inquires WHERE inquiry_id=? AND signup_id=?`, [inquiry_id, signup_id]);
  
      if (inquiry.length === 0) {
        return res.status(404).json({ error: "Inquiry not found or unauthorized" });
      }
      await connection.query(`
        DELETE FROM inquiry_items WHERE inquiry_id=?`, [inquiry_id]);
  
      await connection.query(`
        DELETE FROM inquires WHERE inquiry_id=? AND signup_id=?`, [inquiry_id, signup_id]);
  
      await connection.commit();
  
      res.status(200).json({ message: "Inquiry and its items deleted successfully", inquiry_id })
  
    } catch (error) {
      await connection.rollback();
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" });
  
    }
    finally {
      connection.release();
  
    }
}


module.exports = { addInquiry,updateInquiry, deleteInquiry }
