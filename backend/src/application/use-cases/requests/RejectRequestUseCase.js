// Use Case: Reject request
class RejectRequestUseCase {
  constructor(requestRepository) {
    this.requestRepository = requestRepository;
  }

  async execute(user, requestId, rejectionReason) {
    try {
      console.log(
        "RejectRequestUseCase - user:",
        user.empId,
        "requestId:",
        requestId
      );

      // Validate rejection reason
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        throw new Error("Lý do từ chối không được để trống");
      }

      if (rejectionReason.length > 500) {
        throw new Error("Lý do từ chối không được vượt quá 500 ký tự");
      }

      // Check if user has approval permission
      if (user.role !== "Manager" && user.role !== "Admin") {
        throw new Error("Bạn không có quyền từ chối đơn từ");
      }

      // Get request details
      const request = await this.requestRepository.findById(requestId);
      if (!request) {
        throw new Error("Không tìm thấy đơn từ");
      }

      // Check if request is pending
      if (request.status !== "Chờ duyệt") {
        throw new Error("Đơn từ này đã được xử lý");
      }

      // Check department permission for Manager
      if (
        user.role === "Manager" &&
        request.employeeDepartment !== user.department
      ) {
        throw new Error(
          "Bạn chỉ có thể từ chối đơn từ của nhân viên trong phòng ban"
        );
      }

      // Reject the request
      const success = await this.requestRepository.reject(
        requestId,
        rejectionReason,
        user.empId,
        user.role
      );

      if (!success) {
        throw new Error("Không thể từ chối đơn từ");
      }

      // Send notification to requester
      await this.sendRejectionNotification(request, user, rejectionReason);

      console.log("RejectRequestUseCase - request rejected:", requestId);

      return {
        success: true,
        message: "Đơn từ đã được từ chối",
      };
    } catch (error) {
      console.error("RejectRequestUseCase error:", error);
      throw new Error(`Không thể từ chối đơn từ: ${error.message}`);
    }
  }

  async sendRejectionNotification(request, approver, rejectionReason) {
    try {
      // TODO: Implement notification service
      console.log(
        `Notification: Request ${request.requestId} rejected by ${approver.fullName}. Reason: ${rejectionReason}`
      );

      // In a real implementation, this would:
      // 1. Create notification record for the requester
      // 2. Send email notification with rejection reason
      // 3. Send push notification
    } catch (error) {
      console.error("Failed to send rejection notification:", error);
    }
  }
}

module.exports = RejectRequestUseCase;
