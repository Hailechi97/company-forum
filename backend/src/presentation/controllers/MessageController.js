const MessageRepository = require("../../infrastructure/database/repositories/MessageRepository");
const SendMessageUseCase = require("../../application/use-cases/messages/SendMessageUseCase");
const GetConversationUseCase = require("../../application/use-cases/messages/GetConversationUseCase");
const GetRecentConversationsUseCase = require("../../application/use-cases/messages/GetRecentConversationsUseCase");
const SearchUsersUseCase = require("../../application/use-cases/messages/SearchUsersUseCase");
const GetUserGroupsUseCase = require("../../application/use-cases/messages/GetUserGroupsUseCase");
const SendGroupMessageUseCase = require("../../application/use-cases/messages/SendGroupMessageUseCase");
const GetGroupMessagesUseCase = require("../../application/use-cases/messages/GetGroupMessagesUseCase");
const dbConnection = require("../../infrastructure/database/connection");

class MessageController {
  constructor() {
    this.messageRepository = new MessageRepository(dbConnection);
    this.sendMessageUseCase = new SendMessageUseCase(this.messageRepository);
    this.getConversationUseCase = new GetConversationUseCase(
      this.messageRepository
    );
    this.getRecentConversationsUseCase = new GetRecentConversationsUseCase(
      this.messageRepository
    );
    this.searchUsersUseCase = new SearchUsersUseCase(this.messageRepository);
    this.getUserGroupsUseCase = new GetUserGroupsUseCase(
      this.messageRepository
    );
    this.sendGroupMessageUseCase = new SendGroupMessageUseCase(
      this.messageRepository
    );
    this.getGroupMessagesUseCase = new GetGroupMessagesUseCase(
      this.messageRepository
    );
  }

  // Send private message
  async sendMessage(req, res) {
    try {
      const user = req.user;
      const { receiverId, content, messageType } = req.body;

      console.log(
        "MessageController.sendMessage - user:",
        user.empId,
        "data:",
        { receiverId, content, messageType }
      );

      const result = await this.sendMessageUseCase.execute(
        user.empId,
        receiverId,
        content,
        messageType
      );

      res.status(201).json({
        success: true,
        data: { messageId: result.messageId },
        message: result.message,
      });
    } catch (error) {
      console.error("Send message controller error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get conversation between two users
  async getConversation(req, res) {
    try {
      const user = req.user;
      const { otherUserId } = req.params;
      const { page, limit } = req.query;

      console.log(
        "MessageController.getConversation - user:",
        user.empId,
        "otherUserId:",
        otherUserId
      );

      const result = await this.getConversationUseCase.execute(
        user.empId,
        otherUserId,
        { page: parseInt(page), limit: parseInt(limit) }
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get conversation controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get recent conversations
  async getRecentConversations(req, res) {
    try {
      const user = req.user;
      const { limit } = req.query;

      console.log(
        "MessageController.getRecentConversations - user:",
        user.empId
      );

      const result = await this.getRecentConversationsUseCase.execute(
        user.empId,
        { limit: parseInt(limit) }
      );

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Get recent conversations controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Search users
  async searchUsers(req, res) {
    try {
      const user = req.user;
      const { q: query, limit } = req.query;

      console.log(
        "MessageController.searchUsers - user:",
        user.empId,
        "query:",
        query
      );

      const result = await this.searchUsersUseCase.execute(user.empId, query, {
        limit: parseInt(limit),
      });

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Search users controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get user's groups
  async getUserGroups(req, res) {
    try {
      const user = req.user;

      console.log("MessageController.getUserGroups - user:", user.empId);

      const result = await this.getUserGroupsUseCase.execute(user.empId);

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Get user groups controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Send group message
  async sendGroupMessage(req, res) {
    try {
      const user = req.user;
      const { groupId } = req.params;
      const { content, messageType } = req.body;

      console.log(
        "MessageController.sendGroupMessage - user:",
        user.empId,
        "groupId:",
        groupId
      );

      const result = await this.sendGroupMessageUseCase.execute(
        groupId,
        user.empId,
        content,
        messageType
      );

      res.status(201).json({
        success: true,
        data: { messageId: result.messageId },
        message: result.message,
      });
    } catch (error) {
      console.error("Send group message controller error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get group messages
  async getGroupMessages(req, res) {
    try {
      const user = req.user;
      const { groupId } = req.params;
      const { page, limit } = req.query;

      console.log(
        "MessageController.getGroupMessages - user:",
        user.empId,
        "groupId:",
        groupId
      );

      const result = await this.getGroupMessagesUseCase.execute(groupId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get group messages controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const user = req.user;

      console.log("MessageController.getUnreadCount - user:", user.empId);

      const unreadCount = await this.messageRepository.getUnreadCount(
        user.empId
      );

      res.json({
        success: true,
        data: { unreadCount },
      });
    } catch (error) {
      console.error("Get unread count controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get group members
  async getGroupMembers(req, res) {
    try {
      const { groupId } = req.params;

      console.log("MessageController.getGroupMembers - groupId:", groupId);

      const members = await this.messageRepository.getGroupMembers(groupId);

      res.json({
        success: true,
        data: members,
      });
    } catch (error) {
      console.error("Get group members controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = MessageController;
