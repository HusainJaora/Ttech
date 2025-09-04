const joi = require("joi");

const addCustomerValidation = (req, res, next) => {
  const schema = joi.object({
    customer_name: joi.string()
      .trim()
      .required()
      .messages({
        "string.base": "Customer name must be a string",
        "string.empty": "Customer name is required",
        "any.required": "Customer name is required"
      }),

    customer_contact: joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/) // exactly 10 digits
      .required()
      .messages({
        "string.pattern.base": "Customer contact must be a 10-digit number",
        "string.empty": "Customer contact is required",
        "any.required": "Customer contact is required"
      }),

    customer_email: joi.string()
      .trim()
      .email()
      .allow("NA")
      .optional()
      .messages({
        "string.email": "Invalid email format"
      }),

    customer_address: joi.string()
      .trim()
      .allow("")
      .allow("NA")
      .optional()
      .messages({
        "string.base": "Customer address must be a string"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const updateCustomerValidation = (req, res, next) => {
  const schema = joi.object({
    customer_name: joi.string()
      .trim()
      .optional()
      .messages({
        "string.base": "Customer name must be a string",
        "string.empty": "Customer name cannot be empty"
      }),

    customer_contact: joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/)
      .optional()
      .messages({
        "string.pattern.base": "Customer contact must be a valid 10-digit number",
        "string.empty": "Customer contact cannot be empty"
      }),

    customer_email: joi.string()
      .trim()
      .email()
      .optional()
      .messages({
        "string.email": "Customer email must be a valid email address"
      }),

    customer_address: joi.string()
      .trim()
      .optional()
      .allow("")
      .messages({
        "string.base": "Customer address must be a string"
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const getAllCustomerValidation = async (req, res, next) => {
    const schema = joi.object({
        signup_id: joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                "any.required": "signup_id is required",
                "number.base": "signup_id must be a number",
                "number.integer": "signup_id must be an integer",
                "number.positive": "signup_id must be a positive number"
            })
    }).unknown(true);

    const { error } = schema.validate(req.user);

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }
    next();
};




module.exports = {addCustomerValidation,updateCustomerValidation,getAllCustomerValidation};
