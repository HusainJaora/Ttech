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
            `, [customer_name, customer_contact, customer_email, customer_address, customer_id, signup_id])

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

    } finally {
        connection.release();
    }
}

const getAllcustomer = async (req, res) => {
    const { signup_id } = req.user;

    try {

        const [customers] = await db.query(`
            SELECT customer_id, customer_name, customer_contact, created_date, created_time
            FROM customers
            WHERE signup_id=?
            ORDER BY customer_id DESC
            `, [signup_id]);

        if (customers.length === 0) {
            return res.status(400).json({ message: "No customer found" });
        }



        res.status(200).json({ customers });

    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}

const getSingleCustomer = async (req, res) => {
    const { customer_id } = req.params;
    const { signup_id } = req.user;

    try {
        // fetch profile
        const [customerRows] = await db.query(`
            SELECT customer_id, customer_name, customer_contact, customer_email, customer_address
            FROM customers
            WHERE customer_id = ? AND signup_id= ?
            `, [customer_id, signup_id]);

        if (!customerRows.length) {
            return res.status(404).json({ message: "Customer not found" })
        }
        const profile = customerRows[0];

        const [invoiceRows] = await db.query(
            `SELECT i.invoice_id, i.invoice_no, i.invoice_date, i.source_type, i.status,
                    i.grand_total, 
                    IFNULL(SUM(p.amount), 0) AS amount_paid,
                    (i.grand_total - IFNULL(SUM(p.amount), 0)) AS due_amount
             FROM invoices i
             LEFT JOIN payments p ON i.invoice_id = p.invoice_id
             WHERE i.customer_id = ? AND i.signup_id = ?
             GROUP BY i.invoice_id
             ORDER BY i.invoice_date DESC`,
            [customer_id, signup_id]
        );

        //  Fetch quotations
        const [quotationRows] = await db.query(
            `SELECT quotation_id, quotation_no, quotation_date, quotation_type, total_amount, notes
         FROM quotation
         WHERE customer_id = ? AND signup_id = ?
         ORDER BY quotation_date DESC`,
            [customer_id, signup_id]
        );

        //  Fetch inquiries with technician
        const [inquiryRows] = await db.query(
            `SELECT i.inquiry_id, i.inquiry_no, i.status,
                t.technician_name, i.created_date, i.created_time, i.signup_id
         FROM inquires i
         LEFT JOIN technicians t ON i.technician_id = t.technician_id
         WHERE i.customer_id = ? AND i.signup_id = ?
         ORDER BY i.created_date DESC, i.created_time DESC`,
            [customer_id, signup_id]
        );

        //  Fetch repairs with quotation + inquiry + technician
        const [repairRows] = await db.query(
            `SELECT r.repair_id, r.repair_no, r.repair_status,
                q.quotation_no, i.inquiry_no, t.technician_name
         FROM repairs r
         JOIN quotation q ON r.quotation_id = q.quotation_id
         JOIN inquires i ON r.inquiry_id = i.inquiry_id
         LEFT JOIN technicians t ON r.technician_id = t.technician_id
         WHERE r.customer_id = ? AND r.signup_id = ?
         ORDER BY r.created_date DESC, r.created_time DESC`,
            [customer_id, signup_id]
        );

        const pendingPayments = invoiceRows.filter(inv => inv.due_amount > 0);
        const totalDue = pendingPayments.reduce((sum, inv) => sum + inv.due_amount, 0);

        res.json({
            profile,
            invoices: invoiceRows,
            quotations: quotationRows,
            inquiries: inquiryRows,
            repairs: repairRows,
            pending_payments: pendingPayments,
            total_due: totalDue
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });

    }
}
module.exports = { addCustomer, updateCustomer, getAllcustomer, getSingleCustomer };