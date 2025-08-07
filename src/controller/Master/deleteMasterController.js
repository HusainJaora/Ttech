const db = require("../../db/database");

const deleteSupplier = async(req,res)=>{
    const { supplier_id } = req.params;
    const {signup_id} = req.user;

    try {

        const [result] = await db.query(`
            DELETE FROM suppliers WHERE supplier_id=? AND signup_id=?`,[ supplier_id,signup_id]);
        
            if(result.affectedRows ===0){
                res.status(404).json({message:"Supplier not found or unauthorized"})
            };

            res.status(200).json({message:"Supplier deleted successfully"});
        
    } catch (error) {
        res.status(500).json({error:error.message})
        
    }
};
const deleteBrand = async(req,res)=>{
    const {brand_id} = req.params;
    const {signup_id} = req.user;

    try {

        const [result] = await db.query(`
            DELETE FROM brand WHERE brand_id=? AND signup_id=?`,[ brand_id,signup_id]);
        
            if(result.affectedRows ===0){
                res.status(404).json({message:"Brand not found or unauthorized"})
            };

            res.status(200).json({message:"Brand deleted successfully"});
        
    } catch (error) {
        res.status(500).json({error:error.message})
        
    }
};
const deleteTechnician = async(req,res)=>{
    const { technician_id } = req.params;
    const {signup_id} = req.user;

    try {

        const [result] = await db.query(`
            DELETE FROM technicians WHERE technician_id=? AND signup_id=?`,[ technician_id,signup_id]);
        
            if(result.affectedRows ===0){
                res.status(404).json({message:"Technicain not found or unauthorized"})
            };

            res.status(200).json({message:"Technicain deleted successfully"});
        
    } catch (error) {
        res.status(500).json({error:error.message})
        
    }
};
const deleteProductCategories = async(req,res)=>{
    const {product_category_id} = req.params;
    const {signup_id} = req.user;

    try {

        const [result] = await db.query(`
            DELETE FROM product_categories WHERE product_category_id=? AND signup_id=?`,[product_category_id,signup_id]);
        
            if(result.affectedRows ===0){
                res.status(404).json({message:"Product category not found or unauthorized"})
            };

            res.status(200).json({message:"Product category deleted successfully"});
        
    } catch (error) {
        res.status(500).json({error:error.message})
        
    }
};


module.exports = {deleteSupplier,deleteBrand,deleteTechnician,deleteProductCategories};