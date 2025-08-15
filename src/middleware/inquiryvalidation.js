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
const addinquiryValidation = async (req, res, next) => {
    const schema = joi.object({
     customer_name: joi.string()
          .trim()
          .required()
          .messages({
             "string.base":  "customer name must be string",
             "string.empty": "customer name is required",
             "any.required": "customer name is required"
          }),
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
          customer_email: joi.string()
          .trim()
          .optional()
          .allow("")
          .messages({
             "string.base": " Email must be string"
          }),
       
          customer_address: joi.string()
          .trim()
          .optional()
          .allow("")
          .messages({
             "string.base": " Address name must be string"
          }),
          products: joi.array()
          .items(
             joi.object({
                product_name: joi.string().trim().required().messages({
                   "string.base": "Product name must be string",
                   "string.empty": "Product name is required",
                   "any.required": "Product name is required"
                }),
                problem_description: joi.string().trim().optional().allow(""),
                accessories_given: joi.string().trim().optional().allow("")
             })
          )
          .min(1)
          .required()
          .messages({
             "array.base": "Products must be an array",
             "array.min": "At least one product is required",
             "any.required": "Products are required"
          })
    });
    const { error } = schema.validate(req.body);
 
    if (error) {
       return res.status(400).json({
          error: error.details[0].message
       });
    }
    next();
}

module.exports ={checkCustomerByContactValidation,addinquiryValidation};
