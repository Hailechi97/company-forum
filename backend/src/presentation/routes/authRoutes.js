const express = require("express");
const router = express.Router();

let authController;
let authMiddleware;
let managerRole;

const initializeAuthRoutes = (controller, authMw, managerRoleMw) => {
  authController = controller;
  authMiddleware = authMw;
  managerRole = managerRoleMw;
};

// Login route
router.post("/login", (req, res) => {
  if (!authController) {
    return res.status(500).json({
      success: false,
      message: "Auth controller not initialized",
    });
  }
  authController.login(req, res);
});

// Logout route
router.post("/logout", (req, res) => {
  if (!authController) {
    return res.status(500).json({
      success: false,
      message: "Auth controller not initialized",
    });
  }
  authController.logout(req, res);
});

// Get current user profile
router.get("/me", (req, res) => {
  if (!authController) {
    return res.status(500).json({
      success: false,
      message: "Auth controller not initialized",
    });
  }
  authController.getMe(req, res);
});

// Reset all passwords (Manager only)
router.post("/reset-all-passwords", (req, res) => {
  if (!authController) {
    return res.status(500).json({
      success: false,
      message: "Auth controller not initialized",
    });
  }

  // Apply middleware dynamically
  if (authMiddleware) {
    authMiddleware(req, res, (err) => {
      if (err)
        return res
          .status(401)
          .json({ success: false, message: "Authentication failed" });

      if (managerRole) {
        managerRole(req, res, (err) => {
          if (err)
            return res
              .status(403)
              .json({ success: false, message: "Insufficient permissions" });
          authController.resetAllPasswords(req, res);
        });
      } else {
        authController.resetAllPasswords(req, res);
      }
    });
  } else {
    authController.resetAllPasswords(req, res);
  }
});

// Reset single employee password (Manager only)
router.post("/reset-employee-password/:empId", (req, res) => {
  if (!authController) {
    return res.status(500).json({
      success: false,
      message: "Auth controller not initialized",
    });
  }

  // Apply middleware dynamically
  if (authMiddleware) {
    authMiddleware(req, res, (err) => {
      if (err)
        return res
          .status(401)
          .json({ success: false, message: "Authentication failed" });

      if (managerRole) {
        managerRole(req, res, (err) => {
          if (err)
            return res
              .status(403)
              .json({ success: false, message: "Insufficient permissions" });
          authController.resetEmployeePassword(req, res);
        });
      } else {
        authController.resetEmployeePassword(req, res);
      }
    });
  } else {
    authController.resetEmployeePassword(req, res);
  }
});

module.exports = { router, initializeAuthRoutes };
