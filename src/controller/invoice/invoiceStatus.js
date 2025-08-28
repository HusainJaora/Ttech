const db = require("../../db/database");

const invoiceStatus = async (req, res) => {
    const { invoice_id, new_status } = req.body;
    const { signup_id } = req.user;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Get the invoice
        const [invoices] = await connection.query(
            `SELECT * FROM invoices WHERE invoice_id=? AND signup_id=?`,
            [invoice_id, signup_id]
        );

        if (!invoices.length) {
            await connection.rollback();
            return res.status(404).json({ error: "Invoice not found" });
        }

        const invoice = invoices[0];

        // 2. Allowed transitions
        const allowedTransitions = {
            DRAFT: ["ISSUED", "CANCELLED"],
            ISSUED: ["DRAFT","CANCELLED"]
        };

        if (!allowedTransitions[invoice.status] || 
            !allowedTransitions[invoice.status].includes(new_status)) {
            await connection.rollback();
            return res.status(400).json({ 
                error: `Invalid transition from ${invoice.status} to ${new_status}` 
            });
        }

        // 3. Update invoice
        await connection.query(
            `UPDATE invoices SET status=? WHERE invoice_id=? AND signup_id=?`,
            [new_status, invoice_id, signup_id]
        );

        await connection.commit();

        res.json({
            message: `Invoice status updated from ${invoice.status} to ${new_status}`,
            invoice_id,
            old_status: invoice.status,
            new_status
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error updating invoice status:", error.message);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        connection.release();
    }
};

module.exports = { invoiceStatus };
