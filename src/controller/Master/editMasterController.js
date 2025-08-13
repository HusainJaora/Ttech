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
    const {supplier_id} = req.params;

    if (!supplier_id || !signup_id) {
        return res.status(400).json({ error: "Supplier ID and Signup ID are require." })
    }

    try {
        const [existing] = await db.query(`
            SELECT * FROM suppliers WHERE supplier_id=? AND signup_id=?
            `, [supplier_id, signup_id])

        if (existing.length === 0) {
            return res.status(404).json({ error: "Supplier not found or unauthorized."});
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
const updateTechnician = async (req,res)=>{
    const {technician_name,technician_phone} = req.body;
    const {signup_id} = req.user
    const {technician_id} =req.params;

    try {
        if (!technician_id || !signup_id) {
            return res.status(400).json({ error: "Technician ID and Signup ID are require." });
        }

        const [existing] = await db.query(`
            SELECT * FROM technicians WHERE technician_id=? AND signup_id=?`,[technician_id,signup_id]);

            if(existing.length === 0){
                return res.status(404).json({ error: "Technician name not found or unauthorized."});
            }
        await db.query(`UPDATE technicians SET technician_name=?, technician_phone=? WHERE technician_id=? AND signup_id=? `,[technician_name.trim(),technician_phone.trim()|| null, technician_id, signup_id]);

        res.status(200).json({ message: "Technician updated successfully." });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}
const updateProductCategories = async (req,res)=>{
    const {product_category_name} = req.body;
    const {signup_id} = req.user;
    const {product_category_id} = req.params;

    try {
        if (!product_category_id || !signup_id) {
            return res.status(400).json({ error: "Product Category ID and Signup ID are require."});
        }

        const [existing] = await db.query(`
            SELECT * FROM product_categories WHERE product_category_id=? AND signup_id=?`,[product_category_id,signup_id]);
        if(existing.length === 0){
            res.status(404).json({error: "Product Category not found or unauthorized."})
        }
        await db.query(`
            UPDATE product_categories SET product_category_name=? WHERE product_category_id=? AND signup_id=?`,[product_category_name.trim()|| null,product_category_id,signup_id]);
        
        res.status(200).json({message:"Product category updated successfully."});    

        
    } catch (error) {
        
    }
}


module.exports = {updateSupplier,updateTechnician,updateProductCategories};