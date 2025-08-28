const joi = require("joi");

const addPaymentValidation = async (req, res, next) => {
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

        amount: joi.number()
            .precision(2)
            .positive()
            .required()
            .messages({
                "number.base": "amount must be a number",
                "number.positive": "amount must be greater than 0",
                "any.required": "amount is required"
            }),

        payment_method: joi.string()
            .valid('CASH','DEBIT_CARD','CREDIT_CARD','UPI','CHEQUE','BANK_TRANSFER','NETBANKING','RTGS','NEFT','IMPS')
            .required()
            .messages({
                "string.base": "payment method must be a string",
                "any.only": "payment method must be one of CASH, DEBIT_CARD CREDIT_CARD UPI, CHEQUE, BANK_TRANSFER, NETBANKING, RTGS, NEFT and IMPS",
                "any.required": "payment method is required"
            }),

        notes: joi.string()
            .trim()
            .optional()
            .allow("")
            .messages({
                "string.base": "notes must be a string"
            }),

        reference_no: joi.string()
            .trim()
            .optional()
            .allow("", "na")
            .messages({
                "string.base": "reference no must be a string"
            }),

        payment_date: joi.date()
            .optional()
            .messages({
                "date.base": "payment date must be a valid date"
            }),

        payment_time: joi.string()
            .pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/) // HH:mm:ss
            .optional()
            .messages({
                "string.base": "payment time must be a string",
                "string.pattern.base": "payment time must be in HH:mm:ss format"
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

const deletePaymentValidation = async (req, res, next) => {
    const schema = joi.object({
        payment_id: joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                "number.base": "payment id must be a number",
                "number.integer": "payment id must be an integer",
                "number.positive": "payment id must be positive",
                "any.required": "payment id is required"
            })
    });

    const { error } = schema.validate(req.params);

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }
    next();
};


module.exports = {addPaymentValidation, deletePaymentValidation};
