const Joi = require("joi");

const allowedStatuses = ['Pending','In Progress','Completed','Delivered','Cancelled'];

const repairStatusValidation = (req, res, next) => {
    const schema = Joi.object({
        repair_id: Joi.number().integer().positive().required()
            .messages({
                "number.base": "repair_id must be a number",
                "number.integer": "repair_id must be an integer",
                "number.positive": "repair_id must be positive",
                "any.required": "repair_id is required"
            }),
        new_status: Joi.string().valid(...allowedStatuses).required()
            .messages({
                "any.only": `new_status must be one of: ${allowedStatuses.join(", ")}`,
                "any.required": "new_status is required"
            })
    });

    const data = { ...req.params, ...req.body }; 
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: "Validation error",
            details: error.details.map((d) => d.message),
        });
    }

    next();
};

module.exports = repairStatusValidation;
