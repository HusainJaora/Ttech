const db =require("../db/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async(req,res)=>{
    const {username, email, password} = req.body;
    try {
        // encrypting password
        const hashpassword = await bcrypt.hash(password, 10);

         await db.query(
            "INSERT INTO signup(username,email,password) VALUES(?,?,?)",
            [username.trim(),email.trim(),hashpassword]
         );
         res.status(200).json({message:"user registered successfully"});
        
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};
const login = async(req,res)=>{
    const {username, password} = req.body;
    try {
        const [existing] = await db.query(
            "SELECT * FROM signup WHERE username=? ",
            [username.trim()]
        );

        const user = existing[0];
        if(!user){
            return res.status(409).json({error:"User Does not exists with this email or username"});
        }
        const isPassEqual = await bcrypt.compare(password,user.password);
        if(!isPassEqual){
            return res.status(409).json({error:"User Does not exists with this username or wrong password"});
        }
        const jwtToken = jwt.sign(
            {signup_id:user.signup_id,username:user.password},
            process.env.JWT_SECRET,
            {expiresIn:'24h'}
        )

        res.status(201).json({
            message:"User login successfully",
            jwtToken,
            username:user.username
        });
        
    } catch (error) {
        res.status(500).json({error:error.message});
        
    }
}

module.exports = {
    signup,
    login
}