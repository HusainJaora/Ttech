const db = require("../../db/database");

const getAllRepair = async (req, res) => {
    const { signup_id } = req.user;
    try {
        const [repairs] = await db.query(`
            SELECT r.repair_id, r.repair_no, r.repair_status, r.created_date, r.created_time,
            c.customer_name, t.technician_name,
            GROUP_CONCAT(CONCAT(ii.product_name, ' (', ii.problem_description, ')') SEPARATOR '; ') AS products_with_problems
            FROM repairs r
            JOIN customers c ON r.customer_id = c.customer_id
            LEFT JOIN technicians t ON r.technician_id = t.technician_id
            LEFT JOIN inquiry_items ii ON r.inquiry_id = ii.inquiry_id
            WHERE r.signup_id =?
            GROUP BY r.repair_id
            ORDER BY r.created_date DESC, r.created_time DESC
            `, [signup_id]);

        if (repairs.length === 0) {
            return res.status(200).json({
                message: "No repairs Found."
            })
        }

        res.json(repairs);

    } catch (error) {
        console.error("Subcategory error:", error);
        res.status(500).json({ message: "Server error.", error: error.message });

    }
}

module.exports = { getAllRepair };