const crypto = require("crypto");

// Generete secure refresh token
const generateRefreshToken = ()=> crypto.randomBytes(64).toString("hex");

// Hash refresh Token
const hashtoken = (token) => crypto.createHash("sha256").update(token).digest("hex");

module.exports = {generateRefreshToken, hashtoken};