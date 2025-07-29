const db = require("../../db/database");

const addSupplier = async(req,res)=>{
    const {supplier_Legal_name,supplier_Ledger_name,supplier_contact,supplier_address,supplier_contact_name,supplier_other}=req.body;

    try {

     await db.query(
        "INSERT INTO suppliers(supplier_Legal_name,supplier_Ledger_name,supplier_contact,supplier_address,supplier_contact_name,supplier_other) VALUES(?,?,?,?,?,?)",[supplier_Legal_name.trim(),supplier_Ledger_name.trim(),supplier_contact.trim(),supplier_address.trim(),supplier_contact_name.trim(),supplier_other.trim()]
     );
     res.status(200).json({message:"Supplier added successfully"});
    } catch (error) {
        res.status(500).json({error:error.message})
        
    }
};

module.exports = {addSupplier}

