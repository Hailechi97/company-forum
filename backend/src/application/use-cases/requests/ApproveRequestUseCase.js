// Use Case: Approve request
class ApproveRequestUseCase {
  constructor(requestRepository) {
    this.requestRepository = requestRepository;
  }

  async execute(user, requestId) {
    try {
      console.log(
        "ApproveRequestUseCase - user:",
        user.empId,
        "requestId:",
        requestId
      );

      // Check if user has approval permission
      if (user.role !== "Manager" && user.role !== "Admin") {
        throw new Error("Bạn không có quyền duyệt đơn từ");
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
          "Bạn chỉ có thể duyệt đơn từ của nhân viên trong phòng ban"
        );
      }

      // Approve the request
      const success = await this.requestRepository.approve(
        requestId,
        user.empId,
        user.role
      );

      if (!success) {
        throw new Error("Không thể duyệt đơn từ");
      }

      // Send notification to requester
      await this.sendApprovalNotification(request, user);

      console.log("ApproveRequestUseCase - request approved:", requestId);

      return {
        success: true,
        message: "Đơn từ đã được duyệt thành công",
      };
    } catch (error) {
      console.error("ApproveRequestUseCase error:", error);
      throw new Error(`Không thể duyệt đơn từ: ${error.message}`);
    }
  }

  async sendApprovalNotification(request, approver) {
    try {
      // TODO: Implement notification service
      console.log(
        `Notification: Request ${request.requestId} approved by ${approver.fullName}`
      );

      // In a real implementation, this would:
      // 1. Create notification record for the requester
      // 2. Send email notification
      // 3. Send push notification
    } catch (error) {
      console.error("Failed to send approval notification:", error);
    }
  }
}

module.exports = ApproveRequestUseCase;
