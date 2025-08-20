const db = require("../db/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateRefreshToken, hashtoken } = require("../utils/tokenutils");

const signup = async (req, res) => {
    const { username, email, password, shop_name } = req.body;

    try {
        const hashpassword = await bcrypt.hash(password, 10);

         await db.query(
            "INSERT INTO signup (username, shop_name, email, password) VALUES (?, ?, ?, ?)",
            [username.trim(), shop_name.trim(), email.trim().toLowerCase(), hashpassword]
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

        // create short lived access token

        const accessToken = jwt.sign(
            { signup_id: user.signup_id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        )

        //  generate new refresh token
        const refreshToken = generateRefreshToken();
        const tokenHash = hashtoken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // store hashed token in db
        await db.query(`
            INSERT INTO refresh_token(signup_id,token_hash,expires_at) VALUES(?,?,?)`,
            [user.signup_id, tokenHash, expiresAt])


        res.status(200).json(
            {   message:"Logged in successfully",
                accessToken,
                refreshToken,
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