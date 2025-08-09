// Use Case: Create new request
class CreateRequestUseCase {
  constructor(requestRepository) {
    this.requestRepository = requestRepository;
  }

  async execute(user, requestData) {
    try {
      console.log(
        "CreateRequestUseCase - user:",
        user.empId,
        "data:",
        requestData
      );

      // Validate request data
      this.validateRequestData(requestData);

      // Create request object
      const Request = require("../../../domain/entities/Request");
      const request = new Request({
        empId: user.empId,
        requestType: requestData.requestType,
        title: requestData.title,
        content: requestData.content,
        attachedFile: requestData.attachedFile || null,
        requestDate: new Date(),
        status: "Chờ duyệt",
      });

      // Save to database
      const requestId = await this.requestRepository.create(request);

      // Send notification to managers
      await this.sendNotificationToManagers(requestId, request, user);

      console.log("CreateRequestUseCase - request created:", requestId);

      return {
        success: true,
        requestId,
        message: "Đơn từ đã được gửi thành công",
      };
    } catch (error) {
      console.error("CreateRequestUseCase error:", error);
      throw new Error(`Không thể tạo đơn từ: ${error.message}`);
    }
  }

  validateRequestData(data) {
    if (!data.requestType || data.requestType.trim().length === 0) {
      throw new Error("Loại đơn không được để trống");
    }

    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Tiêu đề không được để trống");
    }

    if (!data.content || data.content.trim().length === 0) {
      throw new Error("Nội dung không được để trống");
    }

    // Validate request type
    const validTypes = [
      "Nghỉ phép",
      "Công tác",
      "Hỗ trợ",
      "Tăng lương",
      "Khác",
    ];
    if (!validTypes.includes(data.requestType)) {
      throw new Error("Loại đơn không hợp lệ");
    }

    // Validate title length
    if (data.title.length > 200) {
      throw new Error("Tiêu đề không được vượt quá 200 ký tự");
    }

    // Validate content length
    if (data.content.length > 2000) {
      throw new Error("Nội dung không được vượt quá 2000 ký tự");
    }
  }

  async sendNotificationToManagers(requestId, request, user) {
    try {
      // TODO: Implement notification service
      // This would send notifications to managers in the same department
      console.log(
        `Notification: New request ${requestId} from ${user.fullName} needs approval`
      );

      // For now, just log the notification
      // In a real implementation, this would:
      // 1. Find managers in the same department
      // 2. Create notification records
      // 3. Send emails/push notifications
    } catch (error) {
      console.error("Failed to send notifications:", error);
      // Don't fail the request creation if notification fails
    }
  }
}

module.exports = CreateRequestUseCase;
