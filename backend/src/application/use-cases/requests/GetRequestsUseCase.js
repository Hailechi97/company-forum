// Use Case: Get requests based on user role
class GetRequestsUseCase {
  constructor(requestRepository) {
    this.requestRepository = requestRepository;
  }

  async execute(user, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        requestType = null,
        status = null,
        viewType = "my_requests", // "my_requests" or "for_approval"
      } = options;

      const offset = (page - 1) * limit;

      console.log(
        "GetRequestsUseCase - user:",
        user.empId,
        "options:",
        options
      );

      let requests = [];

      if (viewType === "for_approval") {
        // Manager/Admin viewing requests for approval
        if (user.role !== "Manager" && user.role !== "Admin") {
          throw new Error("Bạn không có quyền xem đơn cần duyệt");
        }
        requests = await this.requestRepository.findForApproval(
          user.role,
          user.department,
          limit,
          offset
        );
      } else {
        // Employee viewing their own requests
        requests = await this.requestRepository.findByEmployeeId(
          user.empId,
          limit,
          offset
        );
      }

      // Filter by request type if specified
      if (requestType) {
        requests = requests.filter((r) => r.requestType === requestType);
      }

      // Filter by status if specified
      if (status) {
        requests = requests.filter((r) => r.status === status);
      }

      // Add computed properties
      const requestsWithStatus = requests.map((request) => ({
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
      }));

      console.log(
        "GetRequestsUseCase - found requests:",
        requestsWithStatus.length
      );

      return {
        success: true,
        requests: requestsWithStatus,
        pagination: {
          page,
          limit,
          total: requestsWithStatus.length, // For now, not implementing total count
        },
      };
    } catch (error) {
      console.error("GetRequestsUseCase error:", error);
      throw new Error(`Không thể lấy danh sách đơn từ: ${error.message}`);
    }
  }
}

module.exports = GetRequestsUseCase;
