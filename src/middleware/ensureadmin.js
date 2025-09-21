
const ensureAdmin = (req, res, next) => {
    if (req.user && req.user.is_admin === 1) {
      next();
    } else {
      return res.status(403).json({ message: "Only admin can perform this action" });
    }
  };


module.exports = ensureAdmin;
  