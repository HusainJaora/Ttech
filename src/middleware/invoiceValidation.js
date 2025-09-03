const joi = require("joi");

const createInvoiceValidation = async (req, res, next) => {
    const itemSchema = joi.object({
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
        warranty: joi.string().trim().optional().allow("").messages({
            "string.base": "warranty must be string"
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
    });

    const schema = joi.object({
        source_type: joi.string()
            .valid("DIRECT", "QUOTATION", "REPAIR")
            .required()
            .messages({
                "any.only": "source_type must be DIRECT, QUOTATION, or REPAIR",
                "any.required": "source_type is required"
            }),

        source_id: joi.when("source_type", {
            is: joi.valid("QUOTATION", "REPAIR"),
            then: joi.number().integer().positive().required().messages({
                "number.base": "source_id must be a number",
                "number.integer": "source_id must be an integer",
                "number.positive": "source_id must be positive",
                "any.required": "source_id is required for QUOTATION or REPAIR"
            }),
            otherwise: joi.forbidden()
        }),

        invoice_date: joi.date().optional().messages({
            "date.base": "invoice_date must be a valid date"
        }),

        ship_to_name: joi.string().trim().optional().allow("", null).messages({
            "string.base": "ship_to_name must be string"
        }),
        ship_to_address: joi.string().trim().optional().allow("", null).messages({
            "string.base": "ship_to_address must be string"
        }),

        notes_public: joi.string().trim().optional().allow("", null).messages({
            "string.base": "notes_public must be string"
        }),
        notes_internal: joi.string().trim().optional().allow("", null).messages({
            "string.base": "notes_internal must be string"
        }),

        // DIRECT customer fields
        customer_name: joi.when("source_type", {
            is: "DIRECT",
            then: joi.string().trim().required().messages({
                "string.base": "customer_name must be string",
                "string.empty": "customer_name is required",
                "any.required": "customer_name is required for DIRECT invoices"
            }),
            otherwise: joi.forbidden()
        }),

        customer_contact: joi.when("source_type", {
            is: "DIRECT",
            then: joi.string().trim().pattern(/^[0-9]{10}$/).required().messages({
                "string.base": "customer_contact must be string",
                "string.empty": "customer_contact is required",
                "string.pattern.base": "customer_contact must be exactly 10 digits",
                "any.required": "customer_contact is required for DIRECT invoices"
            }),
            otherwise: joi.forbidden()
        }),

        customer_email: joi.when("source_type", {
            is: "DIRECT",
            then: joi.string().trim().email().optional().allow("na", "").messages({
                "string.base": "customer_email must be string",
                "string.email": "customer_email must be valid"
            }),
            otherwise: joi.forbidden()
        }),

        customer_address: joi.when("source_type", {
            is: "DIRECT",
            then: joi.string().trim().optional().allow("na", "").messages({
                "string.base": "customer_address must be string"
            }),
            otherwise: joi.forbidden()
        }),

        items: joi.when("source_type", {
            is: "DIRECT",
            then: joi.array().items(itemSchema).min(1).required().messages({
                "array.base": "items must be an array",
                "array.min": "at least one item is required",
                "any.required": "items are required for DIRECT invoices"
            }),
            otherwise: joi.forbidden()
        }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            errors: error.details.map(d => d.message)
        });
    }

    next();
};


const updateInvoiceValidation = async (req, res, next) => {
    const schema = joi.object({
        invoice_date: joi.date()
            .iso()
            .required()
            .messages({
                "date.base": "invoice date must be a valid date",
                "date.format": "invoice date must be in ISO format (YYYY-MM-DD)",
                "any.required": "invoice date is required"
            }),

        bill_to_name: joi.string()
            .trim()
            .required()
            .messages({
                "string.base": "bill to name must be a string",
                "string.empty": "bill to name is required",
                "any.required": "bill to name is required"
            }),

        bill_to_address: joi.string()
            .trim()
            .required()
            .messages({
                "string.base": "bill to address must be a string",
                "string.empty": "bill to address is required",
                "any.required": "bill to address is required"
            }),

        ship_to_name: joi.string()
            .trim()
            .optional()
            .allow("", null)
            .messages({
                "string.base": "ship to name must be a string"
            }),

        ship_to_address: joi.string()
            .trim()
            .optional()
            .allow("", null)
            .messages({
                "string.base": "ship to address must be a string"
            }),

        notes_public: joi.string()
            .trim()
            .optional()
            .allow("", null)
            .messages({
                "string.base": "notes public must be a string"
            }),

        notes_internal: joi.string()
            .trim()
            .optional()
            .allow("", null)
            .messages({
                "string.base": "notes internal must be a string"
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

        items: joi.array()
            .items(
                joi.object({
                    invoice_item_id: joi.number()
                        .integer()
                        .positive()
                        .optional()
                        .messages({
                            "number.base": "invoice item id must be a number",
                            "number.integer": "invoice item id must be an integer",
                            "number.positive": "invoice item id must be positive"
                        }),

                    product_name: joi.string()
                        .trim()
                        .required()
                        .messages({
                            "string.base": "product name must be a string",
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
                            "string.base": "product description must be a string"
                        }),

                    warranty: joi.string()
                        .trim()
                        .required()
                        .messages({
                            "string.base": "warranty must be a string",
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


module.exports = { createInvoiceValidation, updateInvoiceValidation };
