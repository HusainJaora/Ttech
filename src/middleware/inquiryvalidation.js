const joi = require("joi");

const addinquiryValidation = async (req, res, next) => {
    const schema = joi.object({
        customer_name: joi.string()
            .trim()
            .required()
            .messages({
                "string.base": "customer name must be string",
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
        notes: joi.string()
            .trim()
            .optional()
            .allow("")
            .messages({
                "string.base": " Notes name must be string"
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

const updateInquiryValidation = (req, res, next) => {
    const schema = joi.object({
        notes: joi.string()
            .trim()
            .optional()
            .allow("")
            .messages({
                "string.base": "Notes must be a string"
            }),

        items: joi.array()
            .items(
                joi.object({
                    inquiry_item_id: joi.number()
                        .integer()
                        .positive()
                        .optional(),
                    product_name: joi.string()
                        .trim()
                        .required()
                        .messages({
                            "string.base": "Product name must be a string",
                            "string.empty": "Product name is required",
                            "any.required": "Product name is required"
                        }),
                    problem_description: joi.string()
                        .trim()
                        .optional()
                        .allow("")
                        .messages({
                            "string.base": "Problem description must be a string"
                        }),
                    accessories_given: joi.string()
                        .trim()
                        .optional()
                        .allow("")
                        .messages({
                            "string.base": "Accessories given must be a string"
                        })
                })
            )
            .optional()
            .messages({
                "array.base": "Items must be an array"
            }),

        deleted_item_ids: joi.array()
            .items(
                joi.number()
                    .integer()
                    .positive()
                    .messages({
                        "number.base": "Deleted item IDs must be numbers",
                        "number.positive": "Deleted item IDs must be positive numbers"
                    })
            )
            .optional()
            .messages({
                "array.base": "Deleted item IDs must be an array"
            })
    })
        // Require at least one of these keys in body
        .or("notes", "items", "deleted_item_ids")
        .messages({
            "object.missing": "You must provide notes, items, or deleted_item_ids to update"
        });

    const { error } = schema.validate(req.body);

    if (error) {
        // Send only the first validation error message
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};
const deleteInquiryValidation = (req, res, next) => {
    const schema = joi.object({
        inquiry_id: joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                "number.base": "Inquiry ID must be a number",
                "number.integer": "Inquiry ID must be an integer",
                "number.positive": "Inquiry ID must be a positive number",
                "any.required": "Inquiry ID is required"
            })

    })

    const { error } = schema.validate(req.body);

    if (error) {
        
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};


module.exports = { addinquiryValidation, updateInquiryValidation, deleteInquiryValidation };
