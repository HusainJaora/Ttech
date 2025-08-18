// middleware/updateQuotationStatusValidation.js
const joi = require('joi');

const quotationStatusValidation = async (req, res, next) => {
    const schema = joi.object({
        new_status: joi.string()
            .valid('Draft', 'Sent', 'Accepted', 'Rejected', 'Cancelled')
            .required()
            .messages({
                'any.required': 'New status is required',
                'any.only': 'Invalid status. Must be one of Draft, Sent, Accepted, Rejected, Cancelled'
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

module.exports = {
    quotationStatusValidation
};

