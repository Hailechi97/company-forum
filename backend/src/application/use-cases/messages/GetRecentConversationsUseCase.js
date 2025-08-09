// Use Case: Get Recent Conversations
class GetRecentConversationsUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(userId, options = {}) {
    try {
      const { limit = 20 } = options;

      console.log("GetRecentConversationsUseCase - userId:", userId);

      // Get recent conversations
      const conversations = await this.messageRepository.getRecentConversations(
        userId,
        limit
      );

      console.log(
        "GetRecentConversationsUseCase - found conversations:",
        conversations.length
      );

      return {
        success: true,
        data: conversations,
      };
    } catch (error) {
      console.error("GetRecentConversationsUseCase error:", error);
      throw new Error(
        `Không thể tải danh sách cuộc trò chuyện: ${error.message}`
      );
    }
  }
}

module.exports = GetRecentConversationsUseCase;
