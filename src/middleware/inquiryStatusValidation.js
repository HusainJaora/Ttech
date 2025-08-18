const joi = require("joi");

const assignTechnicianValidation = async (req, res, next) => {
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
      }),

    technician_id: joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base": "Technician ID must be a number",
        "number.integer": "Technician ID must be an integer",
        "number.positive": "Technician ID must be a positive number",
        "any.required": "Technician ID is required"
      })
  });

  const { error } = schema.validate({
    inquiry_id: req.params.inquiry_id,
    technician_id: req.body.technician_id
  });


  if (error) {

    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};


const updateTechnicianValidation = (req, res, next) => {
  const { error } = joi.object({
    inquiry_id: joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "any.required": "Inquiry ID is required",
        "number.base": "Inquiry ID must be a number",
        "number.integer": "Inquiry ID must be an integer",
        "number.positive": "Inquiry ID must be greater than 0",
      }),
    technician_id: joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "any.required": "Technician ID is required",
        "number.base": "Technician ID must be a number",
        "number.integer": "Technician ID must be an integer",
        "number.positive": "Technician ID must be greater than 0",
      }),
  }).validate({
    inquiry_id: req.params.inquiry_id,
    technician_id: req.body.technician_id,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};



const MarkInquiryDoneValidation = (req, res, next) => {
  const { error } = joi.object({
    inquiry_id: joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "any.required": "Inquiry ID is required",
        "number.base": "Inquiry ID must be a number",
        "number.integer": "Inquiry ID must be an integer",
        "number.positive": "Inquiry ID must be greater than 0",
      }),
  }).validate({
    inquiry_id: req.params.inquiry_id,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};


const cancelInquiryValidation = (req, res, next) => {
  const schema = joi.object({
    inquiry_id: joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "any.required": "Inquiry ID is required",
        "number.base": "Inquiry ID must be a number",
        "number.integer": "Inquiry ID must be an integer",
        "number.positive": "Inquiry ID must be greater than 0",
      }),
  });

  const { error } = schema.validate({ inquiry_id: req.params.inquiry_id });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};





module.exports = { assignTechnicianValidation, updateTechnicianValidation, MarkInquiryDoneValidation, cancelInquiryValidation };