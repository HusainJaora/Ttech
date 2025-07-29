const joi = require("joi");
const db = require("../db/database");

const validateDuplicateSupplier = async(req,res,next)=>{
   const {supplier_Legal_name} = req.body;

   try {
    const [existing] = await db.query("SELECT * FROM suppliers WHERE supplier_Legal_name =?",[supplier_Legal_name.trim()]);

 if(existing.length > 0){
    return res.status(409).json({error:"Supplier already exist with same legal name"});
 }

next();
    
   } catch (error) {
    res.status(500).json({error:error.message});
    
   }
}

const supplierValidation = async (req,res,next)=>{
    const schema = joi.object({
      supplier_Legal_name: joi.string()
      .required()
      .messages({
         "string.base":"Legal name must be string",
         "string.empty":"Legal name is required",
         "any.required":"Legal name is required"
      }),
      supplier_Ledger_name:joi.string()
      .optional()
      .allow("")
      .messages({
         "string.base":" Ledger name must be string"
      }),
      supplier_contact:joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.base": "Phone number must be a string",
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be exactly 10 digits",
        "any.required": "Phone number is required",
      }),
      supplier_address:joi.string()
      .optional()
      .allow("")
      .messages({
         "string.base":" Address name must be string"
      }),
      supplier_contact_name:joi.string()
      .required()
      .messages({
         "string.base":"Contact person name must be string",
         "string.empty":"Contact person name is required",
         "any.required":"Contact person name is required"
      }),
      supplier_other:joi.string()
      .optional()
      .allow("")
      .messages({
         "string.base":" Detail must be string"
      }),
    });
    const {error} = schema.validate(req.body);

    if(error){
      return res.status(400).json({
         error: error.details[0].message
      });
    }
    next();
}

module.exports ={
   validateDuplicateSupplier,
   supplierValidation

}