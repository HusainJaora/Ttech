const db = require("../../db/database");

const addPayment = async (req, res) => {
    const { invoice_id, amount, payment_method, notes, reference_no, payment_date, payment_time } = req.body;
    const { signup_id } = req.user;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [invoices] = await connection.query(`
            SELECT * FROM invoices WHERE invoice_id=? AND signup_id=? 
            `, [invoice_id, signup_id]);

        if (!invoices.length) {
            await connection.rollback();
            return res.status(404).json({ error: "Invoice not found" });
        }

        const invoice = invoices[0];

        if (invoice.status == 'DRAFT') {
            await connection.rollback();
            return res.status(400).json({ error: "Cannot add payment because its in draft." });

        }

        const [result] = await connection.query(`
            INSERT INTO payments (invoice_id, payment_date, payment_time, amount, payment_method, notes, reference_no) VALUES (?,?,?,?,?,?,?)
            `,
            [
                invoice_id,
                payment_date || new Date().toISOString().split("T")[0],
                payment_time || new Date().toISOString().split("T")[1].slice(0, 8),
                amount,
                payment_method,
                notes || null,
                reference_no || null,
            ]);

        const new_amount_paid = parseFloat(invoice.new_amount_paid) + parseFloat(amount);
        const new_amount_due = parseFloat(invoice.grand_total) - new_amount_paid;

        if (new_amount_paid > invoice.grand_total) {
            await connection.rollback();
            return res.status(400).json({ error: "Total paid cannot exceed invoice grand total." });
        }

        let new_status = 'PARTIAL';
        if (new_amount_due <= 0) new_status = "PAID";

        await connection.query(`
            UPDATE invoices
            SET amount_paid=?, amount_due=?, status=? 
            WHERE invoice_id=?
             `, [new_amount_paid, new_amount_due, new_status, invoice_id])

        await connection.commit();

        res.status(201).json({
            message: "Payment recorded successfully",
            payment_id: result.insertId,
            invoice_id,
            new_amount_paid,
            new_amount_due,
            status: new_status,
        })
    } catch (error) {
        await connection.rollback();
        console.error("Error adding payment:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }finally{
         connection.release();
    }
}

module.exports = {addPayment};

