const db = require("../../db/database");

const addSupplier = async (req, res) => {
    const {
      supplier_Legal_name,
      supplier_Ledger_name,
      supplier_contact,
      supplier_address,
      supplier_contact_name,
      supplier_other
    } = req.body;
  
    const signup_id = req.user.signup_id; 
  
    try {
      await db.query(
        `INSERT INTO suppliers (
          supplier_Legal_name,
          supplier_Ledger_name,
          supplier_contact,
          supplier_address,
          supplier_contact_name,
          supplier_other,
          signup_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          supplier_Legal_name.trim(),
          supplier_Ledger_name?.trim() || null,
          supplier_contact.trim(),
          supplier_address?.trim() || null,
          supplier_contact_name?.trim() || null,
          supplier_other?.trim() || null,
          signup_id
        ]
      );
  
      res.status(200).json({ message: `Supplier added successfully`});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

const addTechnician = async(req,res)=>{
    const {technician_name,technician_phone} = req.body;
    const signup_id = req.user.signup_id;
    try {
        await db.query("INSERT INTO technicians (technician_name,technician_phone,signup_id) VALUES(?,?,?)",[technician_name.trim(),technician_phone.trim(),signup_id]);
        res.status(200).json({message:"Technicain added successfully"})
        
    } catch (error) {
        res.status(500).json({error:error.message});
    }

};

const addProductCategories = async(req,res)=>{
    const {product_category_name} = req.body;
    const signup_id = req.user.signup_id;
    try {
        await db.query("INSERT INTO product_categories (product_category_name,signup_id) VALUES(?,?)",[product_category_name.trim(),signup_id]);
        res.status(200).json({message:"Product category added successfully"});
        
    } catch (error) {
        res.status(500).json({error:error.message});
    }

};

module.exports = {
    addSupplier,
    addTechnician,
    addProductCategories
}

