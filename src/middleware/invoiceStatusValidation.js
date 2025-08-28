const joi = require("joi");

const invoiceStatusValidation = async (req, res, next) => {
    const schema = joi.object({
        invoice_id: joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                "number.base": "invoice id must be a number",
                "number.integer": "invoice id must be an integer",
                "number.positive": "invoice id must be positive",
                "any.required": "invoice id is required"
            }),

        new_status: joi.string()
            .valid("DRAFT", "ISSUED", "CANCELLED")
            .required()
            .messages({
                "string.base": "status must be a string",
                "any.only": "status must be one of DRAFT, ISSUED, or CANCELLED",
                "any.required": "status is required"
            }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }
    next();
};

module.exports = { invoiceStatusValidation };
