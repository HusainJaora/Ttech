const db = require("../db/database");
const jwt = require("jsonwebtoken");
const { generateRefreshToken, hashtoken } = require("../utils/tokenutils");

const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            error: "Refresh token required"
        });
    }

    const tokenHash = hashtoken(refreshToken);
    try {
        // Check if refresh token exists and is still valid
        const [rows] = await db.query(
            "SELECT * FROM refresh_token WHERE token_hash = ? AND expires_at > NOW()",
            [tokenHash]
        );

        const tokenData = rows[0];
        if (!tokenData) {
            return res.status(403).json({ error: "Invalid or expired refresh token" });
        }

        // Delete used refresh token (rotation)
        await db.query("DELETE FROM refresh_token WHERE refresh_token_id = ?", [tokenData.refresh_token_id]);

        // Generate new refresh token
        const newRefreshToken = generateRefreshToken();
        const newTokenHash = hashtoken(newRefreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await db.query(
            "INSERT INTO refresh_token (signup_id, token_hash, expires_at) VALUES (?, ?, ?)",
            [tokenData.signup_id, newTokenHash, expiresAt]
        );

        // Generate new access token (15min expiry)
        const accessToken = jwt.sign(
            { signup_id: tokenData.signup_id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.status(200).json({
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




module.exports = refreshAccessToken;

