const db = require("../db/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateRefreshToken, hashtoken } = require("../utils/tokenutils");


const login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // 2. Fetch user by email (normalized)
        const [existing] = await db.query(
            "SELECT * FROM signup WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        const user = existing[0];
        if (!user) {
            // Do not reveal whether email or password is wrong
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // 3. Compare hashed password
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // 4. Generate short-lived access token
        const accessToken = jwt.sign(
            { signup_id: user.signup_id, is_admin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // 5. Generate refresh token (raw)
        const refreshToken = generateRefreshToken();

        // 6. Hash refresh token for DB storage
        const tokenHash = hashtoken(refreshToken);

        // 7. Expiry date (7 days)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // 8. Store hashed refresh token in DB
        await db.query(
            `INSERT INTO refresh_token (signup_id, token_hash, expires_at) VALUES (?, ?, ?)`,
            [user.signup_id, tokenHash, expiresAt]
        );

        // 9. Respond with raw refresh token + access token
        res.status(200).json({
            message: "Logged in successfully",
            accessToken,
            refreshToken, // raw token → client stores this
            username: user.username,
            shop_name: user.shop_name,
        });

    } catch (error) {
        console.error(error); // Log for debugging
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports =  login;
   
