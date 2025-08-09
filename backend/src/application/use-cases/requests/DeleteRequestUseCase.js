// Use Case: Delete request (only if pending)
class DeleteRequestUseCase {
  constructor(requestRepository) {
    this.requestRepository = requestRepository;
  }

  async execute(user, requestId) {
    try {
      console.log(
        "DeleteRequestUseCase - user:",
        user.empId,
        "requestId:",
        requestId
      );

      // Get request details
      const request = await this.requestRepository.findById(requestId);
      if (!request) {
        throw new Error("Không tìm thấy đơn từ");
      }

      // Check if user can delete this request
      if (!request.canBeDeletedBy(user.empId, user.role)) {
        throw new Error("Bạn không có quyền xóa đơn từ này");
      }

      // Delete the request
      const success = await this.requestRepository.delete(requestId);

      if (!success) {
        throw new Error("Không thể xóa đơn từ");
      }

      console.log("DeleteRequestUseCase - request deleted:", requestId);

      return {
        success: true,
        message: "Đơn từ đã được xóa thành công",
      };
    } catch (error) {
      console.error("DeleteRequestUseCase error:", error);
      throw new Error(`Không thể xóa đơn từ: ${error.message}`);
    }
  }
}

module.exports = DeleteRequestUseCase;
