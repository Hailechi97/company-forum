class RequestController {
  constructor(requestRepository) {
    this.requestRepository = requestRepository;

    // Initialize use cases
    const CreateRequestUseCase = require("../../application/use-cases/requests/CreateRequestUseCase");
    const GetRequestsUseCase = require("../../application/use-cases/requests/GetRequestsUseCase");
    const GetRequestDetailsUseCase = require("../../application/use-cases/requests/GetRequestDetailsUseCase");
    const ApproveRequestUseCase = require("../../application/use-cases/requests/ApproveRequestUseCase");
    const RejectRequestUseCase = require("../../application/use-cases/requests/RejectRequestUseCase");
    const UpdateRequestUseCase = require("../../application/use-cases/requests/UpdateRequestUseCase");
    const DeleteRequestUseCase = require("../../application/use-cases/requests/DeleteRequestUseCase");

    this.createRequestUseCase = new CreateRequestUseCase(requestRepository);
    this.getRequestsUseCase = new GetRequestsUseCase(requestRepository);
    this.getRequestDetailsUseCase = new GetRequestDetailsUseCase(
      requestRepository
    );
    this.approveRequestUseCase = new ApproveRequestUseCase(requestRepository);
    this.rejectRequestUseCase = new RejectRequestUseCase(requestRepository);
    this.updateRequestUseCase = new UpdateRequestUseCase(requestRepository);
    this.deleteRequestUseCase = new DeleteRequestUseCase(requestRepository);
  }

  // Get requests list
  async getRequests(req, res) {
    try {
      const user = req.user;
      const {
        page = 1,
        limit = 20,
        requestType,
        status,
        viewType = "my_requests", // "my_requests" or "for_approval"
      } = req.query;

      console.log("RequestController.getRequests - user:", user.empId);

      const result = await this.getRequestsUseCase.execute(user, {
        page: parseInt(page),
        limit: parseInt(limit),
        requestType,
        status,
        viewType,
      });

      res.json({
        success: true,
        data: result.requests,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get requests controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get request details
  async getRequestById(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;

      console.log(
        "RequestController.getRequestById - user:",
        user.empId,
        "id:",
        id
      );

      const result = await this.getRequestDetailsUseCase.execute(
        user,
        parseInt(id)
      );

      res.json({
        success: true,
        data: result.request,
      });
    } catch (error) {
      console.error("Get request details controller error:", error);
      const statusCode = error.message.includes("không có quyền")
        ? 403
        : error.message.includes("không tìm thấy")
        ? 404
        : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Create new request
  async createRequest(req, res) {
    try {
      const user = req.user;
      const requestData = req.body;

      console.log(
        "RequestController.createRequest - user:",
        user.empId,
        "data:",
        requestData
      );

      const result = await this.createRequestUseCase.execute(user, requestData);

      res.status(201).json({
        success: true,
        data: { requestId: result.requestId },
        message: result.message,
      });
    } catch (error) {
      console.error("Create request controller error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update request
  async updateRequest(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const updateData = req.body;

      console.log(
        "RequestController.updateRequest - user:",
        user.empId,
        "id:",
        id
      );

      const result = await this.updateRequestUseCase.execute(
        user,
        parseInt(id),
        updateData
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Update request controller error:", error);
      const statusCode = error.message.includes("không có quyền")
        ? 403
        : error.message.includes("không tìm thấy")
        ? 404
        : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete request
  async deleteRequest(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;

      console.log(
        "RequestController.deleteRequest - user:",
        user.empId,
        "id:",
        id
      );

      const result = await this.deleteRequestUseCase.execute(
        user,
        parseInt(id)
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Delete request controller error:", error);
      const statusCode = error.message.includes("không có quyền")
        ? 403
        : error.message.includes("không tìm thấy")
        ? 404
        : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Approve request
  async approveRequest(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;

      console.log(
        "RequestController.approveRequest - user:",
        user.empId,
        "id:",
        id
      );

      const result = await this.approveRequestUseCase.execute(
        user,
        parseInt(id)
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Approve request controller error:", error);
      const statusCode = error.message.includes("không có quyền")
        ? 403
        : error.message.includes("không tìm thấy")
        ? 404
        : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Reject request
  async rejectRequest(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const { rejectionReason } = req.body;

      console.log(
        "RequestController.rejectRequest - user:",
        user.empId,
        "id:",
        id
      );

      const result = await this.rejectRequestUseCase.execute(
        user,
        parseInt(id),
        rejectionReason
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Reject request controller error:", error);
      const statusCode = error.message.includes("không có quyền")
        ? 403
        : error.message.includes("không tìm thấy")
        ? 404
        : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get request statistics
  async getStatistics(req, res) {
    try {
      const user = req.user;
      const { viewType = "my_requests" } = req.query;

      console.log("RequestController.getStatistics - user:", user.empId);

      let stats;
      if (
        viewType === "for_approval" &&
        (user.role === "Manager" || user.role === "Admin")
      ) {
        // Statistics for manager/admin
        const department = user.role === "Admin" ? null : user.department;
        stats = await this.requestRepository.getStatistics(null, department);
      } else {
        // Statistics for employee
        stats = await this.requestRepository.getStatistics(user.empId);
      }

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get statistics controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = RequestController;
