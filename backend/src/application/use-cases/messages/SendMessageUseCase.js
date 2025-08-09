// Use Case: Send Message
class SendMessageUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(
    senderId,
    receiverId,
    content,
    messageType = "text",
    attachedFile = null
  ) {
    try {
      // Validate input
      if (!senderId || !receiverId || !content) {
        throw new Error("Thiếu thông tin gửi tin nhắn");
      }

      if (senderId === receiverId) {
        throw new Error("Không thể gửi tin nhắn cho chính mình");
      }

      // Create message object
      const Message = require("../../../domain/entities/Message");
      const message = new Message({
        senderId,
        receiverId,
        content: content.trim(),
        messageType,
        attachedFile,
      });

      // Save to database
      const messageId = await this.messageRepository.create(message);

      return {
        success: true,
        messageId,
        message: "Tin nhắn đã được gửi thành công",
      };
    } catch (error) {
      console.error("SendMessageUseCase error:", error);
      throw new Error(`Không thể gửi tin nhắn: ${error.message}`);
    }
  }
}

module.exports = SendMessageUseCase;
