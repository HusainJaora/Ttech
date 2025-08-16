const db = require("../db/database");

const addCustomer = async (req, res) => {
    const { signup_id } = req.user;
    const { customer_name, customer_contact, customer_email = "NA", customer_address = "NA" } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.query(`
            SELECT customer_id FROM customers WHERE customer_contact=? AND signup_id=?`, [customer_contact, signup_id]);

        if (existing.length > 0) {
            return res.status(400).json({ error: "Customer with this contact already exists" });

        }

        const [result] = await connection.query(`
            INSERT INTO customers(signup_id, customer_name, customer_contact, customer_email, customer_address) VALUES(?, ?, ?, ?, ?)`, [signup_id, customer_name, customer_contact, customer_email, customer_address]);

        await connection.commit();
        return res.status(201).json({
            message: "Customer added succesfully",
            customer: {
                customer_id: result.insertId,
                customer_name,
                customer_contact,
                customer_email,
                customer_address
            }
        })

    } catch (error) {
        await connection.rollback();
        console.error("Error adding customer:", error);
        return res.status(500).json({ error: "Internal server error" });


    } finally {
        connection.release();
    }
}

const updateCustomer = async (req, res) => {
    const { signup_id } = req.user;
    const { customer_id } = req.params;
    const { customer_name, customer_contact, customer_email, customer_address } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [existing] = await connection.query(
            `SELECT * FROM customers WHERE customer_id = ? AND signup_id = ?`,
            [customer_id, signup_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }

        await connection.query(`
            UPDATE customers
            SET
            customer_name=COALESCE(?,customer_name),
            customer_contact = COALESCE(?, customer_contact),
            customer_email = COALESCE(?, customer_email),
            customer_address = COALESCE(?, customer_address)
            WHERE customer_id=? AND signup_id = ?  
            `,[customer_name, customer_contact, customer_email, customer_address, customer_id, signup_id])

        await connection.commit();

        return res.status(200).json({
            message: "Customer updated successfully",
            customer: {
                customer_id,
                customer_name: customer_name ?? existing[0].customer_name,
                customer_contact: customer_contact ?? existing[0].customer_contact,
                customer_email: customer_email ?? existing[0].customer_email,
                customer_address: customer_address ?? existing[0].customer_address
            }
        });

    }
    catch (error) {
        await connection.rollback();
        console.error("Error updating customer:", error);
        return res.status(500).json({ error: "Internal server error" });

    }finally {
        connection.release();
      }
}

module.exports = { addCustomer, updateCustomer};