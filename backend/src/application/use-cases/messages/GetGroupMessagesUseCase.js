// Use Case: Get Group Messages
class GetGroupMessagesUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(groupId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;

      console.log("GetGroupMessagesUseCase - groupId:", groupId);

      // Get group messages
      const messages = await this.messageRepository.getGroupMessages(
        groupId,
        limit,
        offset
      );

      console.log("GetGroupMessagesUseCase - found messages:", messages.length);

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
      console.error("GetGroupMessagesUseCase error:", error);
      throw new Error(`Không thể tải tin nhắn nhóm: ${error.message}`);
    }
  }
}

module.exports = GetGroupMessagesUseCase;
