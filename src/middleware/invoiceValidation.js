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

module.exports = {createInvoiceValidation};
