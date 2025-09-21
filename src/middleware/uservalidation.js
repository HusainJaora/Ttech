const joi = require("joi");
const db = require("../db/database");
const rateLimit = require("express-rate-limit");


const validateDuplicateUser = async (req, res, next) => {
  const { email } = req.body;
  try {
    const [existing] = await db.query(
      "SELECT * FROM signup WHERE email = ?",
      [email.trim().toLowerCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const signupValidation = async (req, res, next) => {
  const schema = joi.object({
    username: joi.string()
      .trim()
      .min(3)
      .max(30)
      .required()
      .messages({
        "string.base": "Username must be a string",
        "string.empty": "Username is required",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must be less than or equal to 30 characters",
        "any.required": "Username is required",
      }),

  
    email: joi.string()
      .trim()
      .email()
      .required()
      .messages({
        "string.email": "Email must be a valid email",
        "string.empty": "Email is required",
        "any.required": "Email is required",
      }),

    password: joi.string()
      .trim()
      .min(6)
      .max(20)
      .required()
      .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters",
        "string.max": "Password must be less than or equal to 20 characters",
        "any.required": "Password is required",
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};

const validateLogin = async (req, res, next) => {
  // Validation schema
  const schema = joi.object({
    email: joi.string().trim().email().required().messages({
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
    password: joi.string().trim().required().messages({
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};  

const loginLimiter = rateLimit({
  windowsMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many login attempts, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,

})

module.exports = {
  validateDuplicateUser,
  signupValidation,
  validateLogin,
  loginLimiter
}
