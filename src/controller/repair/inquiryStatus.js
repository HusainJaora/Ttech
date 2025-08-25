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

    } finally {
        connection.release();
    }
}
// technician will only update if status is in technicain assiganed stage
const updateTechnician = async (req, res) => {
    const { inquiry_id } = req.params;
    const { technician_id } = req.body;
    const { signup_id } = req.user;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        //    check current status of inquiry 
        const [inquiry] = await connection.query(`
        SELECT status from inquires WHERE inquiry_id=? AND signup_id=?`, [inquiry_id, signup_id]);

        if (inquiry.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Inquiry not found" })
        }
        if (inquiry[0].status !== "Technician Assigned") {
            await connection.rollback();
            return res.status(400).json({
                message: "Technician can only be updated when inquiry status is 'Technician Assigned"
            })

        }

        await connection.query(`
        UPDATE inquires SET technician_id=? WHERE 
        inquiry_id=? AND signup_id=?`, [technician_id, inquiry_id, signup_id]);

        await connection.commit();

        return res.status(200).json({
            message: "Technicain updated Successfully",
            inquiry_id,
            technician_id,

        })

    } catch (error) {
        await connection.rollback();
        console.error("Error updating technician:", error);
        return res.status(500).json({ message: "Internal server error" });
    }finally{
        connection.release();
    }
}

// Inquiry  will only update to mark if status is in technicain assiganed stage
const markInquiryDone = async (req, res) => {
    const { inquiry_id } = req.params;
    const { signup_id } = req.user; 
  
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Only allow marking as Done if technician is already assigned
      const [result] = await connection.query(
        `UPDATE inquires
         SET status = 'Done'
         WHERE inquiry_id = ? AND signup_id = ? AND status = 'Technician Assigned'`,
        [inquiry_id, signup_id]
      );
  
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(400).json({ 
          message: "Inquiry not found, not assigned yet, or already marked as Done" 
        });
      }
  
      await connection.commit();
      res.status(200).json({ message: "Inquiry marked as Done successfully" });
    } catch (error) {
      await connection.rollback();
      console.error("Error marking inquiry as done:", error);
      res.status(500).json({ message: "Server error" });
    } finally {
      connection.release();
    }
};  
// Inquiry  will only update to mark if status is in technicain assiganed or pending stage
const cancelInquiry = async (req, res) => {
    const { inquiry_id } = req.params;
    const { signup_id } = req.user; 
  
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Can only cancel if it's not already Done or Cancelled
      const [result] = await connection.query(
        `UPDATE inquires
         SET status = 'Cancelled'
         WHERE inquiry_id = ? AND signup_id = ? 
         AND status IN ('Pending', 'Technician Assigned')`,
        [inquiry_id, signup_id]
      );
  
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(400).json({ 
          message: "Inquiry not found, already done, or already cancelled" 
        });
      }
  
      await connection.commit();
      res.status(200).json({ message: "Inquiry cancelled successfully" });
    } catch (error) {
      await connection.rollback();
      console.error("Error cancelling inquiry:", error);
      res.status(500).json({ message: "Server error" });
    } finally {
      connection.release();
    }
};
  

module.exports = { assignTechnician, updateTechnician, markInquiryDone, cancelInquiry}