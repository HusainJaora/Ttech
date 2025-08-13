const joi = require("joi");
const db = require("../db/database");

// supplier validation
const validateDuplicateSupplier = async (req, res, next) => {
   const { supplier_Legal_name } = req.body;
   const signup_id = req.user.signup_id;

   try {
      const [existing] = await db.query(
         "SELECT * FROM suppliers WHERE supplier_Legal_name = ? AND signup_id = ?",
         [supplier_Legal_name.trim(), signup_id]
      );

      if (existing.length > 0) {
         return res.status(409).json({ error: "Supplier already exists with the same legal name for your shop." });
      }

      next();
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};


const supplierValidation = async (req, res, next) => {
   const schema = joi.object({
      supplier_Legal_name: joi.string()
         .trim()
         .required()
         .messages({
            "string.base": "Legal name must be string",
            "string.empty": "Legal name is required",
            "any.required": "Legal name is required"
         }),
      supplier_Ledger_name: joi.string()
         .trim()
         .optional()
         .allow("")
         .messages({
            "string.base": " Ledger name must be string"
         }),
      supplier_contact: joi.string()
         .trim()
         .pattern(/^[0-9]{10}$/)
         .required()
         .messages({
            "string.base": "Phone number must be a string",
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must be exactly 10 digits",
            "any.required": "Phone number is required",
         }),
      supplier_address: joi.string()
         .trim()
         .optional()
         .allow("")
         .messages({
            "string.base": " Address name must be string"
         }),
      supplier_contact_name: joi.string()
         .trim()
         .required()
         .messages({
            "string.base": "Contact person name must be string",
            "string.empty": "Contact person name is required",
            "any.required": "Contact person name is required"
         }),
      supplier_other: joi.string()
         .trim()
         .optional()
         .allow("")
         .messages({
            "string.base": " Detail must be string"
         }),
   });
   const { error } = schema.validate(req.body);

   if (error) {
      return res.status(400).json({
         error: error.details[0].message
      });
   }
   next();
}
// Technician Validation
const validateDuplicateTechnician = async (req, res, next) => {
   const { technician_phone } = req.body
   const signup_id = req.user.signup_id;
   try {
      const [existing] = await db.query("SELECT * FROM technicians WHERE technician_phone=? AND signup_id = ?", [technician_phone.trim(),signup_id])

      if (existing.length > 0) {
         return res.status(409).json({ error: "Technician already exist with same number" });

      }
      next();
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
}
const validateTechnician = async (req, res, next) => {
   const schema = joi.object({
      technician_name: joi.string()
         .trim()
         .required()
         .messages({
            "string.base": "Technician name must be string",
            "string.empty": "Technician name is required",
            "any.required": "Technician name is required"

         }),
      technician_phone: joi.string()
         .trim()
         .pattern(/^[0-9]{10}$/)
         .required()
         .messages({
            "string.base": "Phone number must be a string",
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must be exactly 10 digits",
            "any.required": "Phone number is required",
         }),


   })
   const { error } = schema.validate(req.body);

   if (error) {
      return res.status(400).json({
         error: error.details[0].message
      });
   }
   next();

}
// Product Category Validation
const validateDuplicateProductCategory = async (req, res, next) => {
   const { product_category_name } = req.body
   const signup_id = req.user.signup_id;

   try {
      const [existing] = await db.query("SELECT * FROM product_categories WHERE product_category_name=? AND signup_id = ?", [product_category_name.trim(),signup_id])

      if (existing.length > 0) {
         return res.status(409).json({ error: "Category already exist with same name" });

      }
      next();
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
}

const validateProductCategory = async (req, res, next) => {
   const schema = joi.object({
      product_category_name: joi.string()
         .trim()
         .required()
         .messages({
            "string.base": "Category name must be string",
            "string.empty": "Category name is required",
            "any.required": "Category name is required"

         })
   })
   const { error } = schema.validate(req.body);

   if (error) {
      return res.status(400).json({
         error: error.details[0].message
      });
   }
   next();

}


module.exports = {
   validateDuplicateSupplier,
   supplierValidation,
   validateDuplicateTechnician,
   validateTechnician,
   validateDuplicateProductCategory,
   validateProductCategory
}
