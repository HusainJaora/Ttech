const joi = require("joi");
const db = require("../db/database");

const validateDuplicateUser=async(req,res,next)=>{
    const {username, email} = req.body
    try {
        const [existing] = await db.query(
            "SELECT * FROM signup WHERE email =? OR username=?",[email.trim(),username.trim()] 
        );
        if(existing.length >0){
            return res.status(409).json({error:"User already exists with same email or username"});
        }
        next();

    } catch (error) {
        res.status(500).json({error:error.message});
        
    }
}

const signupValidation = async (req, res, next) => {
    const schema = joi.object({
      username: joi.string()
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
        .email()
        .required()
        .messages({
          "string.email": "Email must be a valid email",
          "string.empty": "Email is required",
          "any.required": "Email is required",
        }),
  
      password: joi.string()
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
    const tableFeild = joi.object({
      username: joi.string().required().messages({
        "any.required": "Username is required",
        "string.empty": "Username cannot be empty",
      }),
      password: joi.string().required().messages({
        "any.required": "Password is required",
        "string.empty": "Password cannot be empty",
      }),
    });
  
    const { error } = tableFeild.validate(req.body);
  
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
    next();
  };

module.exports ={
    validateDuplicateUser,
    signupValidation,
    validateLogin
}
