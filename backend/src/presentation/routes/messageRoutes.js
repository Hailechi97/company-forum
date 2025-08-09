const express = require("express");
const MessageController = require("../controllers/MessageController");
const UserRepository = require("../../infrastructure/database/repositories/UserRepository");
const dbConnection = require("../../infrastructure/database/connection");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Create dependencies
const userRepository = new UserRepository(dbConnection);
const messageController = new MessageController();

// Apply auth middleware to all routes
router.use(authMiddleware(userRepository));

// Private messaging routes
router.post("/send", (req, res) => messageController.sendMessage(req, res));
router.get("/recent", (req, res) =>
  messageController.getRecentConversations(req, res)
);
router.get("/conversation/:otherUserId", (req, res) =>
  messageController.getConversation(req, res)
);
router.get("/search", (req, res) => messageController.searchUsers(req, res));
router.get("/unread-count", (req, res) =>
  messageController.getUnreadCount(req, res)
);

// Group messaging routes
router.get("/groups", (req, res) => messageController.getUserGroups(req, res));
router.get("/group/:groupId", (req, res) =>
  messageController.getGroupMessages(req, res)
);
router.post("/group/:groupId", (req, res) =>
  messageController.sendGroupMessage(req, res)
);
router.get("/groups/:groupId/members", (req, res) =>
  messageController.getGroupMembers(req, res)
);

module.exports = router;
