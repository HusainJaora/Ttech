const jwt = require("jsonwebtoken");


const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.header("Authorization");

    // Check if header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied, JWT token required" });
    }

    const token = authHeader.split(" ")[1]; // Extract token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // attach user payload to request
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "JWT token has expired" });
        }
        return res.status(401).json({ message: "Invalid JWT token" });
    }
};


module.exports = ensureAuthenticated;