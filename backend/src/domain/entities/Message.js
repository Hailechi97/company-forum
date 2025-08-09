// Domain Entity: Message
class Message {
  constructor({
    messageId = null,
    senderId,
    receiverId,
    content,
    messageType = "text",
    attachedFile = null,
    sentAt = new Date(),
    isRead = false,
    isDeleted = false,
    // Additional fields from joins
    senderName = null,
    senderPhoto = null,
    receiverName = null,
    receiverPhoto = null,
  }) {
    this.messageId = messageId;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.messageType = messageType;
    this.attachedFile = attachedFile;
    this.sentAt = sentAt;
    this.isRead = isRead;
    this.isDeleted = isDeleted;
    this.senderName = senderName;
    this.senderPhoto = senderPhoto;
    this.receiverName = receiverName;
    this.receiverPhoto = receiverPhoto;
  }

  // Domain methods
  canBeDeletedBy(empId) {
    return this.senderId === empId;
  }

  canBeEditedBy(empId) {
    return this.senderId === empId && this.messageType === "text";
  }

  markAsRead() {
    this.isRead = true;
  }

  markAsDeleted() {
    this.isDeleted = true;
  }

  isFromSender(empId) {
    return this.senderId === empId;
  }

  getFormattedTime() {
    return this.sentAt.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getFormattedDate() {
    return this.sentAt.toLocaleDateString("vi-VN");
  }
}

module.exports = Message;
