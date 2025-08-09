const express = require("express");
const router = express.Router();

// Import dependencies
const UserRepository = require("../../infrastructure/database/repositories/UserRepository");
const UserController = require("../controllers/UserController");
const { authMiddleware } = require("../middleware/authMiddleware");
const databaseConnection = require("../../infrastructure/database/connection");

// Initialize dependencies
const userRepository = new UserRepository(databaseConnection);
const userController = new UserController(userRepository);
const authMw = authMiddleware(userRepository);

// Apply auth middleware to all routes
router.use(authMw);

// Routes
router.get("/profile", (req, res) => userController.getProfile(req, res));
router.get("/department/:department", (req, res) =>
  userController.getUsersByDepartment(req, res)
);
router.get("/:id", (req, res) => userController.getUserById(req, res));
router.put("/:id", (req, res) => userController.updateUser(req, res));
router.delete("/:id", (req, res) => userController.deleteUser(req, res));
router.post("/", (req, res) => userController.createUser(req, res));

module.exports = router;
