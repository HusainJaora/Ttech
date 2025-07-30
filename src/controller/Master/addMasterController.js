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

const addBrand = async(req,res)=>{
    const {brand_name} = req.body;
    try {
        await db.query("INSERT INTO brand (brand_name) VALUES(?)",
            [brand_name.trim()]
        )
        res.status(200).json({message:"Brand added successfully"})
        
    } catch (error) {
        res.status(500).json({error:error.message});
        
    }
};
const addTechnician = async(req,res)=>{
    const {technician_name,technician_phone} = req.body;
    try {
        await db.query("INSERT INTO technicians (technician_name,technician_phone) VALUES(?,?)",[technician_name.trim(),technician_phone.trim()]);
        res.status(200).json({message:"Technicain added successfully"})
        
    } catch (error) {
        res.status(500).json({error:error.message});
    }

};

module.exports = {
    addSupplier,
    addBrand,
    addTechnician
}

