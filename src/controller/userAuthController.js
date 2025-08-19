const db = require("../db/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
    const { username, email, password, shop_name } = req.body;

    try {
        const hashpassword = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO signup (username, shop_name, email, password) VALUES (?, ?, ?, ?)",
            [username.trim(), shop_name.trim(), email.trim().toLowerCase(), hashpassword ]
        );

        res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            res.status(409).json({ error: "User with this email or username already exists" });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Fetch user by email
        const [existing] = await db.query(
            "SELECT * FROM signup WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        const user = existing[0];
        if (!user) {
            // Avoid revealing which field is wrong
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare hashed password
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { signup_id: user.signup_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "User logged in successfully",
            jwtToken,
            username: user.username,
            shop_name: user.shop_name
        });

    } catch (error) {
        console.error(error); // log internal error
        res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports = {
    signup,
    login
}