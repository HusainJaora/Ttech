const joi = require("joi");



const addQuotationValidation = async (req, res, next) => {
    const schema = joi.object({
        customer_name: joi.string()
            .trim()
            .when("inquiry_id", {
                is: joi.exist(),
                then: joi.optional(),
                otherwise: joi.required()
            })
            .messages({
                "string.base": "customer name must be string",
                "string.empty": "customer name is required",
                "any.required": "customer name is required"
            }),

        customer_contact: joi.string()
            .trim()
            .pattern(/^[0-9]{10}$/)
            .when("inquiry_id", {
                is: joi.exist(),
                then: joi.optional(),
                otherwise: joi.required()
            })
            .messages({
                "string.base": "phone number must be string",
                "string.empty": "phone number is required",
                "string.pattern.base": "phone number must be exactly 10 digits",
                "any.required": "phone number is required",
            }),

        customer_email: joi.string()
            .trim()
            .email()
            .optional()
            .allow("na", "")
            .messages({
                "string.base": "email must be string",
                "string.email": "email must be valid"
            }),

        customer_address: joi.string()
            .trim()
            .optional()
            .allow("na", "")
            .messages({
                "string.base": "address must be string"
            }),

        notes: joi.string()
            .trim()
            .optional()
            .allow("")
            .messages({
                "string.base": "notes must be string"
            }),

        inquiry_id: joi.number()
            .integer()
            .positive()
            .optional()
            .messages({
                "number.base": "inquiry id must be a number",
                "number.integer": "inquiry id must be an integer",
                "number.positive": "inquiry id must be positive"
            }),

        items: joi.array()
            .items(
                joi.object({
                    product_name: joi.string().trim().required().messages({
                        "string.base": "product name must be string",
                        "string.empty": "product name is required",
                        "any.required": "product name is required"
                    }),
                    product_category_id: joi.number().integer().optional().allow(null).messages({
                        "number.base": "product category id must be a number",
                        "number.integer": "product category id must be an integer"
                    }),
                    product_description: joi.string().trim().optional().allow("").messages({
                        "string.base": "product description must be string"
                    }),
                    warranty: joi.string().trim().required().messages({
                        "string.base": "warranty must be string",
                        "string.empty": "warranty is required",
                        "any.required": "warranty is required"
                    }),
                    quantity: joi.number().integer().min(1).required().messages({
                        "number.base": "quantity must be a number",
                        "number.integer": "quantity must be an integer",
                        "number.min": "quantity must be at least 1",
                        "any.required": "quantity is required"
                    }),
                    unit_price: joi.number().precision(2).min(0).required().messages({
                        "number.base": "unit price must be a number",
                        "number.min": "unit price must be at least 0",
                        "any.required": "unit price is required"
                    }),
                })
            )
            .min(1)
            .required()
            .messages({
                "array.base": "items must be an array",
                "array.min": "at least one item is required",
                "any.required": "items are required"
            })
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }
    next();
};


const updateQuotationValidation = async (req, res, next) => {
    const schema = joi.object({
        notes: joi.string()
            .trim()
            .optional()
            .allow("")
            .messages({
                "string.base": "notes must be a string"
            }),

        items: joi.array()
            .items(
                joi.object({
                    item_id: joi.number()
                        .integer()
                        .positive()
                        .optional()
                        .messages({
                            "number.base": "item id must be a number",
                            "number.integer": "item id must be an integer",
                            "number.positive": "item id must be positive"
                        }),

                    product_name: joi.string()
                        .trim()
                        .required()
                        .messages({
                            "string.base": "product name must be string",
                            "string.empty": "product name is required",
                            "any.required": "product name is required"
                        }),

                    product_category_id: joi.number()
                        .integer()
                        .positive()
                        .required()
                        .messages({
                            "number.base": "product category id must be a number",
                            "number.integer": "product category id must be an integer",
                            "number.positive": "product category id must be positive",
                            "any.required": "product category id is required"
                        }),

                    product_description: joi.string()
                        .trim()
                        .optional()
                        .allow("", null)
                        .messages({
                            "string.base": "product description must be string"
                        }),

                    warranty: joi.string().trim().required().messages({
                        "string.base": "warranty must be string",
                        "string.empty": "warranty is required",
                        "any.required": "warranty is required"
                    }),

                    quantity: joi.number()
                        .integer()
                        .min(1)
                        .required()
                        .messages({
                            "number.base": "quantity must be a number",
                            "number.integer": "quantity must be an integer",
                            "number.min": "quantity must be at least 1",
                            "any.required": "quantity is required"
                        }),

                    unit_price: joi.number()
                        .precision(2)
                        .min(0)
                        .required()
                        .messages({
                            "number.base": "unit price must be a number",
                            "number.min": "unit price must be at least 0",
                            "any.required": "unit price is required"
                        })
                })
            )
            .optional()
            .messages({
                "array.base": "items must be an array"
            }),

        deleted_item_ids: joi.array()
            .items(
                joi.number()
                    .integer()
                    .positive()
                    .messages({
                        "number.base": "deleted item id must be a number",
                        "number.integer": "deleted item id must be an integer",
                        "number.positive": "deleted item id must be positive"
                    })
            )
            .optional()
            .messages({
                "array.base": "deleted item ids must be an array"
            }),

        quotation_type: joi.string()
            .valid("product", "service")
            .optional()
            .messages({
                "any.only": "quotation type must be either product or service"
            })
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            errors: error.details.map((err) => err.message)
        });
    }

    next();
};


const deleteQuotationValidation = async (req, res, next) => {
    const schema = joi.object({
        quotation_id: joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                "number.base": "quotation id must be a number",
                "number.integer": "quotation id must be an integer",
                "number.positive": "quotation id must be positive",
                "any.required": "quotation id is required"
            })
    });

    // Validate from params
    const { error } = schema.validate(req.params, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            errors: error.details.map((err) => err.message)
        });
    }

    next();
};


module.exports = { addQuotationValidation, updateQuotationValidation, deleteQuotationValidation };