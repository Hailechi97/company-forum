// Use Case: Get request details
class GetRequestDetailsUseCase {
  constructor(requestRepository) {
    this.requestRepository = requestRepository;
  }

  async execute(user, requestId) {
    try {
      console.log(
        "GetRequestDetailsUseCase - user:",
        user.empId,
        "requestId:",
        requestId
      );

      // Get request details
      const request = await this.requestRepository.findById(requestId);
      if (!request) {
        throw new Error("Không tìm thấy đơn từ");
      }

      // Check permissions
      const canView = this.canUserViewRequest(user, request);
      if (!canView) {
        throw new Error("Bạn không có quyền xem đơn từ này");
      }

      // Add computed properties
      const requestDetails = {
        ...request,
        canEdit: request.canBeEditedBy(user.empId, user.role),
        canDelete: request.canBeDeletedBy(user.empId, user.role),
        canApprove: request.canBeApprovedBy(
          user.empId,
          user.role,
          user.department
        ),
        isEditable: request.isEditable(),
        isPending: request.isPending(),
        isApproved: request.isApproved(),
        isRejected: request.isRejected(),
        statusClass: request.getStatusClass(),
        requestTypeDisplay: request.getRequestTypeDisplay(),
      };

      console.log("GetRequestDetailsUseCase - request found:", request.title);

      return {
        success: true,
        request: requestDetails,
      };
    } catch (error) {
      console.error("GetRequestDetailsUseCase error:", error);
      throw new Error(`Không thể lấy chi tiết đơn từ: ${error.message}`);
    }
  }

  canUserViewRequest(user, request) {
    // Employee can view their own requests
    if (request.empId === user.empId) {
      return true;
    }

    // Admin can view all requests
    if (user.role === "Admin") {
      return true;
    }

    // Manager can view requests from their department
    if (
      user.role === "Manager" &&
      request.employeeDepartment === user.department
    ) {
      return true;
    }

    return false;
  }
}

module.exports = GetRequestDetailsUseCase;
