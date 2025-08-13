const jwt = require("jsonwebtoken");
const ensureAuthenricated = (req, res, next) => {
    const auth = req.header('Authorization');
    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(403).json({ message: 'unauthorized, JWT token is required' });
    }
    const token = auth.split(" ")[1];
    // Extract the actual token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Unauthorized, JWT token is invalid or expired' });

    }
};

module.exports = ensureAuthenricated;