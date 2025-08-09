// Use Case: Get Conversation
class GetConversationUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(userId, otherUserId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;

      console.log(
        "GetConversationUseCase - userId:",
        userId,
        "otherUserId:",
        otherUserId
      );

      // Get conversation messages
      const messages = await this.messageRepository.getConversation(
        userId,
        otherUserId,
        limit,
        offset
      );

      // Mark messages as read
      await this.messageRepository.markAsRead(userId, otherUserId);

      console.log("GetConversationUseCase - found messages:", messages.length);

      return {
        success: true,
        data: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          hasMore: messages.length === limit,
        },
      };
    } catch (error) {
      console.error("GetConversationUseCase error:", error);
      throw new Error(`Không thể tải cuộc trò chuyện: ${error.message}`);
    }
  }
}

module.exports = GetConversationUseCase;
