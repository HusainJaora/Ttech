const joi = require("joi");

const checkCustomerByContactValidation = async (req, res, next) => {
   const schema = joi.object({
         customer_contact: joi.string()
         .trim()
         .pattern(/^[0-9]{10}$/)
         .required()
         .messages({
            "string.base": "Phone number must be a string",
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must be exactly 10 digits",
            "any.required": "Phone number is required",
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

module.exports = checkCustomerByContactValidation;