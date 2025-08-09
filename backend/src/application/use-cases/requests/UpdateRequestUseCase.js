// Use Case: Update request (only if pending)
class UpdateRequestUseCase {
  constructor(requestRepository) {
    this.requestRepository = requestRepository;
  }

  async execute(user, requestId, updateData) {
    try {
      console.log(
        "UpdateRequestUseCase - user:",
        user.empId,
        "requestId:",
        requestId
      );

      // Get request details
      const request = await this.requestRepository.findById(requestId);
      if (!request) {
        throw new Error("Không tìm thấy đơn từ");
      }

      // Check if user can edit this request
      if (!request.canBeEditedBy(user.empId, user.role)) {
        throw new Error("Bạn không có quyền chỉnh sửa đơn từ này");
      }

      // Validate update data
      this.validateUpdateData(updateData);

      // Update the request
      const success = await this.requestRepository.update(
        requestId,
        updateData
      );

      if (!success) {
        throw new Error("Không thể cập nhật đơn từ");
      }

      console.log("UpdateRequestUseCase - request updated:", requestId);

      return {
        success: true,
        message: "Đơn từ đã được cập nhật thành công",
      };
    } catch (error) {
      console.error("UpdateRequestUseCase error:", error);
      throw new Error(`Không thể cập nhật đơn từ: ${error.message}`);
    }
  }

  validateUpdateData(data) {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Tiêu đề không được để trống");
    }

    if (!data.content || data.content.trim().length === 0) {
      throw new Error("Nội dung không được để trống");
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
}

module.exports = UpdateRequestUseCase;
