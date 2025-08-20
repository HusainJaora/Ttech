const db = require("../db/database");
const { hashtoken } = require("../utils/tokenutils");

const logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

    const tokenHash = hashtoken(refreshToken);

    try {
        await db.query(`DELETE FROM refresh_tokens WHERE token_hash = ?`, [tokenHash]);

        res.status(200).json({ message: "Logged out successfully" });



    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });

    }



}

module.exports = logout;

