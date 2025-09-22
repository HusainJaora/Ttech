const joi = require("joi");

const addProfileValidation = async (req, res, next) => {
  const schema = joi.object({
    business_name: joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        "string.base": "business name must be string",
        "string.empty": "business name is required",
        "string.min": "business name must be at least 2 characters",
        "string.max": "business name must not exceed 100 characters",
        "any.required": "business name is required",
      }),

    business_email: joi.string()
      .trim()
      .email()
      .required()
      .messages({
        "string.base": "business email must be string",
        "string.email": "business email must be valid",
        "any.required": "business email is required",
      }),

    address: joi.string()
      .trim()
      .max(255)
      .required()
      .messages({
        "string.base": "address must be string",
        "string.empty": "address is required",
        "string.max": "address must not exceed 255 characters",
        "any.required": "address is required",
      }),

    mobile_number: joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.base": "mobile number must be string",
        "string.empty": "mobile number is required",
        "string.pattern.base": "mobile number must be exactly 10 digits",
        "any.required": "mobile number is required",
      }),

    bank_name: joi.string()
      .trim()
      .max(100)
      .required()
      .messages({
        "string.base": "bank name must be string",
        "string.empty": "bank name is required",
        "string.max": "bank name must not exceed 100 characters",
        "any.required": "bank name is required",
      }),

    account_number: joi.string()
      .trim()
      .pattern(/^[0-9]{9,18}$/)
      .required()
      .messages({
        "string.base": "account number must be string",
        "string.empty": "account number is required",
        "string.pattern.base": "account number must be 9–18 digits",
        "any.required": "account number is required",
      }),

    ifsc_code: joi.string()
      .trim()
      .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .required()
      .messages({
        "string.base": "IFSC code must be string",
        "string.empty": "IFSC code is required",
        "string.pattern.base": "IFSC code must follow the standard format (e.g., SBIN0001234)",
        "any.required": "IFSC code is required",
      }),

    branch_name: joi.string()
      .trim()
      .max(100)
      .required()
      .messages({
        "string.base": "branch name must be string",
        "string.empty": "branch name is required",
        "string.max": "branch name must not exceed 100 characters",
        "any.required": "branch name is required",
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message, // only first error
    });
  }

  next();
};

module.exports = {addProfileValidation};
