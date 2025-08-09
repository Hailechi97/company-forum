const jwt = require("jsonwebtoken");

const authMiddleware = (userRepository) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided.",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Auth middleware - decoded token:", decoded);

      const user = await userRepository.findById(decoded.userId);
      console.log(
        "Auth middleware - found user:",
        JSON.stringify(user, null, 2)
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. User not found.",
        });
      }

      if (user.status !== "Hoạt động") {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated.",
        });
      }

      req.user = user;
      console.log(
        "Auth middleware - req.user set to:",
        JSON.stringify(req.user, null, 2)
      );
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
  };
};

const optionalAuthMiddleware = (userRepository) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        req.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userRepository.findById(decoded.userId);

      req.user = user && user.isActive ? user : null;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  };
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
};
