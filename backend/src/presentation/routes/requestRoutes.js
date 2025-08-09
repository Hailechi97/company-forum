const express = require("express");
const router = express.Router();

// Import dependencies
const RequestRepository = require("../../infrastructure/database/repositories/RequestRepository");
const UserRepository = require("../../infrastructure/database/repositories/UserRepository");
const RequestController = require("../controllers/RequestController");
const { authMiddleware } = require("../middleware/authMiddleware");
const databaseConnection = require("../../infrastructure/database/connection");

// Initialize dependencies
const requestRepository = new RequestRepository(databaseConnection);
const userRepository = new UserRepository(databaseConnection);
const requestController = new RequestController(requestRepository);
const authMw = authMiddleware(userRepository);

// Apply auth middleware to all routes
router.use(authMw);

// Routes
router.get("/", (req, res) => requestController.getRequests(req, res));
router.get("/statistics", (req, res) =>
  requestController.getStatistics(req, res)
);
router.get("/:id", (req, res) => requestController.getRequestById(req, res));
router.post("/", (req, res) => requestController.createRequest(req, res));
router.put("/:id", (req, res) => requestController.updateRequest(req, res));
router.delete("/:id", (req, res) => requestController.deleteRequest(req, res));
router.put("/:id/approve", (req, res) =>
  requestController.approveRequest(req, res)
);
router.put("/:id/reject", (req, res) =>
  requestController.rejectRequest(req, res)
);

module.exports = router;
