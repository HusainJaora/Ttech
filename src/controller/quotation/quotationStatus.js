const db = require("../../db/database");

const quotationStatus = async (req, res) => {
    const { quotation_id } = req.params;
    const { new_status } = req.body;
    const { signup_id } = req.user;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Fetch current status
        const [rows] = await connection.query(
            `SELECT status FROM quotation WHERE quotation_id = ? AND signup_id = ?`,
            [quotation_id, signup_id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "Quotation not found." });
        }

        const currentStatus = rows[0].status;

        // 2. Define allowed transitions
        const allowedTransitions = {
            Draft: ["Sent","Cancelled"],
            Sent: ["Accepted", "Rejected", "Cancelled"],
            Rejected: ["Sent", "Cancelled"]
            // Accepted and Cancelled have no further transitions
        };

        const validNextStatuses = allowedTransitions[currentStatus] || [];
        if (!validNextStatuses.includes(new_status)) {
            return res.status(400).json({ 
                message: `Cannot change status from ${currentStatus} to ${new_status}.`
            });
        }

        // 3. Update status
        await connection.query(
            `UPDATE quotation SET status = ? WHERE quotation_id = ?`,
            [new_status, quotation_id]
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


module.exports = {quotationStatus}