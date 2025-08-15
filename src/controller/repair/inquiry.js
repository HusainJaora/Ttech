const { exist } = require("joi");
const db = require("../../db/database");
const {  createCustomer } = require("../../utils/getOrCreateCustomer");


const addInquiry = async (req, res) => {
    const {
        customer_name,
        customer_contact,
        customer_email = "NA",
        customer_address = "NA",
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
             (signup_id, inquiry_serial, inquiry_no, customer_id) 
             VALUES (?, ?, ?, ?)`,
            [signup_id, nextSerial, inquiry_no, customer_id]
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

module.exports = { addInquiry }
