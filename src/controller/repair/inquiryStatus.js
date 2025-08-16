const db = require("../../db/database");

const assignTechnician = async (req, res) => {
    const { inquiry_id } = req.params;
    const { technician_id } = req.body;
    const { signup_id } = req.user;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(` 
            UPDATE inquires SET technician_id=?, status= 'Technician Assigned' WHERE inquiry_id=? AND signup_id = ? AND status='Pending'`,
            [technician_id, inquiry_id, signup_id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Inquiry not found or already assigned" });
        }
        await connection.commit();
        res.status(200).json({ message: "Technician assigned successfully" });

    } catch (error) {
        await connection.rollback();
    console.error("Error assigning technician:", error);
    res.status(500).json({ message: "Server error" });

    }finally {
        connection.release();
      }
}


module.exports ={assignTechnician}