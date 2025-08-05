const db = require("../../db/database");

const updateSupplier = async (req, res) => {
    const {
        supplier_Legal_name,
        supplier_Ledger_name,
        supplier_contact,
        supplier_address,
        supplier_contact_name,
        supplier_other
    } = req.body;
    const signup_id = req.user?.signup_id;
    const supplier_id = req.params.supplier_id;

    if (!supplier_id || !signup_id) {
        return res.status(400).json({ error: "Supplier ID and Signup ID are require." })
    }

    try {
        console.log("Decoded token:", req.user);  // Debug
        console.log("Supplier ID:", req.params.supplier_id); // Debug
        const [existing] = await db.query(`
            SELECT * FROM suppliers WHERE supplier_id=? AND signup_id=?
            `, [supplier_id, signup_id])

        if (existing.length === 0) {
            return res.status(404).json({ error: "Supplier not found or unauthorized.", supplier_id, signup_id});
        }

        await db.query(`UPDATE suppliers SET
            supplier_Legal_name = ?, 
            supplier_Ledger_name = ?, 
            supplier_contact = ?, 
            supplier_address = ?, 
            supplier_contact_name = ?, 
            supplier_other = ?
            WHERE supplier_id = ? AND signup_id = ?`,
            [supplier_Legal_name?.trim() || null,
            supplier_Ledger_name?.trim() || null,
            supplier_contact?.trim() || null,
            supplier_address?.trim() || null,
            supplier_contact_name?.trim() || null,
            supplier_other?.trim() || null,
            supplier_id,
            signup_id]);

        res.status(200).json({message:"Supplier updated succesfully"});    


    } catch (error) {
        res.status(500).json({ error: error.message });

    }

}

module.exports = {updateSupplier};