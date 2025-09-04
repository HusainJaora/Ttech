const db = require("../../db/database");

const getSingleRepair = async (req, res) => {
    const { repair_id } = req.params;
    const { signup_id } = req.user;

    try {
        // 1. Fetch repair with customer, technician, quotation, inquiry
        const [repairRows] = await db.query(
            `SELECT r.repair_id, r.repair_no, r.repair_status, r.created_date, r.created_time,
                    q.quotation_id, q.quotation_no, q.status AS quotation_status, q.total_amount AS quotation_total,
                    c.customer_id, c.customer_name, c.customer_email, c.customer_contact,
                    t.technician_id, t.technician_name,
                    r.inquiry_id
             FROM repairs r
             JOIN customers c ON r.customer_id = c.customer_id
             JOIN quotation q ON r.quotation_id = q.quotation_id
             LEFT JOIN technicians t ON r.technician_id = t.technician_id
             WHERE r.repair_id = ? AND r.signup_id = ?`,
            [repair_id, signup_id]
        );

        if (!repairRows.length) {
            return res.status(404).json({ message: "Repair not found." });
        }

        const repair = repairRows[0];

        const [inquiryRows] = await db.query(
            `SELECT inquiry_no
             FROM inquires
             WHERE inquiry_id = ?`,
            [repair.inquiry_id]
        );

        const inquiryNo = inquiryRows.length ? inquiryRows[0].inquiry_no : null;

        // 2. Fetch inquiry items (products + problems)
        const [inquiryItems] = await db.query(
            `SELECT  product_name, problem_description accessories_given
             FROM inquiry_items
             WHERE inquiry_id = ?`,
            [repair.inquiry_id]
        );

        // 3. Fetch quotation items (products / parts used in repair)
        const [quotationItems] = await db.query(
            `SELECT  product_name, product_description, warranty, quantity, unit_price, total_price
             FROM quotation_items
             WHERE quotation_id = ?`,
            [repair.quotation_id]
        );

        // 4. Return structured JSON
        res.json({
            repair: {
                // repair_id: repair.repair_id,
                repair_no: repair.repair_no,
                status: repair.repair_status,
                created_date: repair.created_date,
                created_time: repair.created_time
            },
            inquiry:{
                // inquiry_id: repair.inquiry_id,
                inquiry_no: inquiryNo

            },
            customer: {
                // customer_id: repair.customer_id,
                customer_name: repair.customer_name,
                customer_email: repair.customer_email,
                customer_contact: repair.customer_contact
            },
            technician: repair.technician_id ? {
                // technician_id: repair.technician_id,
                technician_name: repair.technician_name
            } : null,

            quotation: {
                // quotation_id: repair.quotation_id,
                quotation_no: repair.quotation_no,
                status: repair.quotation_status,
                total_amount: repair.quotation_total
            },
            quotation_items: quotationItems,
            inquiry_items: inquiryItems
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

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
            return res.status(400).json({
                message: "No repairs Found."
            })
        }

        res.json(repairs);

    } catch (error) {
        console.error("Subcategory error:", error);
        res.status(500).json({ message: "Server error.", error: error.message });

    }
}

module.exports = { getAllRepair, getSingleRepair };