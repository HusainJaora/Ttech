const db = require("../../db/database");

const repairStatus = async (req, res) => {
    const { repair_id } = req.params;
    const { new_status } = req.body;
    const { signup_id } = req.user;

    const allowedStatuses = ['Pending','In Progress','Completed','Delivered','Cancelled'];

    if (!allowedStatuses.includes(new_status)) {
        return res.status(400).json({ message: `Invalid status: ${new_status}` });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Fetch current repair status
        const [rows] = await connection.query(
            `SELECT repair_status FROM repairs WHERE repair_id = ? AND signup_id = ? FOR UPDATE`,
            [repair_id, signup_id]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "Repair not found." });
        }

        const currentStatus = rows[0].repair_status;

        // Define allowed transitions
        const transitions = {
            Pending: ['In Progress','Cancelled'],
            'In Progress': ['Completed','Cancelled'],
            Completed: ['Delivered'],
            Delivered: [],
            Cancelled: []
        };

        const validNextStatuses = transitions[currentStatus] || [];
        if (!validNextStatuses.includes(new_status)) {
            return res.status(400).json({
                message: `Cannot change status from ${currentStatus} to ${new_status}`
            });
        }

        // Update repair status
        await connection.query(
            `UPDATE repairs SET repair_status = ? WHERE repair_id = ?`,
            [new_status, repair_id]
        );

        await connection.commit();
        res.json({ message: `Repair status updated to ${new_status}` });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Server error" });
    } finally {
        connection.release();
    }
};

module.exports = repairStatus;
