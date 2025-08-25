const db = require("../../db/database");


const quotationStatus = async (req, res) => {
    const { quotation_id } = req.params;
    const { new_status } = req.body;
    const { signup_id } = req.user;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 🔒 Lock the quotation row
        const [quotationRows] = await connection.query(
            `SELECT * FROM quotation 
             WHERE quotation_id = ? AND signup_id = ? 
             FOR UPDATE`,
            [quotation_id, signup_id]
        );

        if (!quotationRows.length) {
            return res.status(404).json({ message: "Quotation not found." });
        }

        const quotation = quotationRows[0];
        const currentStatus = quotation.status;

        // ✅ Get customer + inquiry info (no FOR UPDATE here)
        const [extraRows] = await connection.query(
            `SELECT c.customer_name, i.technician_id
             FROM quotation q
             LEFT JOIN customers c 
                    ON q.customer_id = c.customer_id AND q.signup_id = c.signup_id
             LEFT JOIN inquires i 
                    ON q.inquiry_id = i.inquiry_id AND q.signup_id = i.signup_id
             WHERE q.quotation_id = ? AND q.signup_id = ?`,
            [quotation_id, signup_id]
        );

        if (extraRows.length) {
            quotation.customer_name = extraRows[0].customer_name;
            quotation.technician_id = extraRows[0].technician_id;
        }

        //  Allowed transitions
        const allowedTransitions = {
            Draft: ["Sent", "Cancelled"],
            Sent: ["Accepted", "Rejected", "Cancelled"],
            Rejected: ["Sent", "Cancelled"]
        };

        const validNextStatuses = allowedTransitions[currentStatus] || [];
        if (!validNextStatuses.includes(new_status)) {
            return res.status(400).json({
                message: `Cannot change status from ${currentStatus} to ${new_status}.`
            });
        }

        // 🔧 Create repair if needed
        if (new_status === "Accepted" && quotation.quotation_type === "Repair") {
            const now = new Date();
            const month = now.toLocaleString("default", { month: "short" }).toUpperCase();
            const year = now.getFullYear().toString().slice(-2);

            const [latest] = await connection.query(
                "SELECT MAX(repair_serial) AS max_serial FROM repairs WHERE signup_id = ?",
                [signup_id]
            );

            const nextSerial = (latest[0].max_serial || 0) + 1;
            const repair_no = `R${String(nextSerial).padStart(3, "0")}/${month}/${year}`;

            await connection.query(
                `INSERT INTO repairs
                 (signup_id, repair_serial, repair_no, quotation_id, inquiry_id, customer_id, technician_id, repair_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
                [
                    signup_id,
                    nextSerial,
                    repair_no,
                    quotation.quotation_id,
                    quotation.inquiry_id,
                    quotation.customer_id,
                    quotation.technician_id
                ]
            );
        }

        // 📝 Update quotation status
        await connection.query(
            `UPDATE quotation 
             SET status = ? 
             WHERE quotation_id = ? AND signup_id = ?`,
            [new_status, quotation_id, signup_id]
        );

        await connection.commit();
        res.json({ message: `Quotation status updated to ${new_status}.` });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Server error." });
    } finally {
        connection.release();
    }
};







module.exports = { quotationStatus }