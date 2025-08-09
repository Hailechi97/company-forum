// Use Case: Send Group Message
class SendGroupMessageUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(
    groupId,
    senderId,
    content,
    messageType = "text",
    attachedFile = null
  ) {
    try {
      // Validate input
      if (!groupId || !senderId || !content) {
        throw new Error("Thiếu thông tin gửi tin nhắn nhóm");
      }

      console.log(
        "SendGroupMessageUseCase - groupId:",
        groupId,
        "senderId:",
        senderId
      );

      // Send group message
      const messageId = await this.messageRepository.createGroupMessage(
        groupId,
        senderId,
        content.trim(),
        messageType,
        attachedFile
      );

      return {
        success: true,
        messageId,
        message: "Tin nhắn nhóm đã được gửi thành công",
      };
    } catch (error) {
      console.error("SendGroupMessageUseCase error:", error);
      throw new Error(`Không thể gửi tin nhắn nhóm: ${error.message}`);
    }
  }
}

module.exports = SendGroupMessageUseCase;
