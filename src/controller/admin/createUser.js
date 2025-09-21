const db = require("../../db/database");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
    const { username, email, password} = req.body;

    try {
        const hashpassword = await bcrypt.hash(password, 10);

         await db.query(
            "INSERT INTO signup (username, email, password) VALUES (?, ?, ?)",
            [username.trim(), email.trim().toLowerCase(), hashpassword]
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

module.exports = signup;