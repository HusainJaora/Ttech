const joi = require("joi");
const db = require("../db/database");

const validateDuplicateTechnicianEdit = async (req, res, next) => {
    const { technician_phone } = req.body;
    const { signup_id } = req.user;
    const { technician_id } = req.params;

    try {
        const [existing] = await db.query(
            `SELECT * FROM technicians WHERE technician_phone = ? AND signup_id = ? AND technician_id != ?`,
            [technician_phone.trim(), signup_id, technician_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: "Technician phone number already exists." });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports ={validateDuplicateTechnicianEdit};