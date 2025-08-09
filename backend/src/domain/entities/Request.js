// Domain Entity: Request
class Request {
  constructor({
    requestId = null,
    empId,
    requestType,
    title,
    content,
    requestDate = new Date(),
    status = "Chờ duyệt",
    approvedBy = null,
    approvedDate = null,
    approverRole,
    attachedFile = null,
    rejectionReason = null,
  }) {
    this.requestId = requestId;
    this.empId = empId;
    this.requestType = requestType;
    this.title = title;
    this.content = content;
    this.requestDate = requestDate;
    this.status = status;
    this.approvedBy = approvedBy;
    this.approvedDate = approvedDate;
    this.approverRole = approverRole;
    this.attachedFile = attachedFile;
    this.rejectionReason = rejectionReason;
  }

  // Domain methods
  canBeEditedBy(empId, userRole) {
    // Only the requester can edit their pending requests
    if (this.empId === empId && this.status === "Chờ duyệt") return true;

    return false;
  }

  canBeApprovedBy(empId, userRole) {
    // Only managers and admins can approve requests
    if (userRole === "Manager" || userRole === "Admin") {
      // Cannot approve own requests
      return this.empId !== empId;
    }

    return false;
  }

  isPending() {
    return this.status === "Chờ duyệt";
  }

  isApproved() {
    return this.status === "Đã duyệt";
  }

  isRejected() {
    return this.status === "Từ chối";
  }

  approve(approverEmpId, approverRole) {
    if (!this.isPending()) {
      throw new Error("Request is not in pending status");
    }

    this.status = "Đã duyệt";
    this.approvedBy = approverEmpId;
    this.approvedDate = new Date();
    this.approverRole = approverRole;
    this.rejectionReason = null;
  }

  reject(approverEmpId, approverRole, rejectionReason) {
    if (!this.isPending()) {
      throw new Error("Request is not in pending status");
    }

    this.status = "Từ chối";
    this.approvedBy = approverEmpId;
    this.approvedDate = new Date();
    this.approverRole = approverRole;
    this.rejectionReason = rejectionReason;
  }

  update({ content, attachedFile }) {
    if (!this.isPending()) {
      throw new Error("Cannot edit non-pending request");
    }

    if (content) this.content = content;
    if (attachedFile !== undefined) this.attachedFile = attachedFile;
  }

  addAttachment(filePath) {
    this.attachedFile = filePath;
  }

  removeAttachment() {
    this.attachedFile = null;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.empId) {
      errors.push("Employee ID is required");
    }

    if (!this.requestType) {
      errors.push("Request type is required");
    }

    if (!this.content || this.content.length < 10) {
      errors.push("Content must be at least 10 characters");
    }

    if (!this.approverRole) {
      errors.push("Approver role is required");
    }

    const validTypes = ["Nghỉ phép", "Công tác", "Hỗ trợ", "Tăng lương"];
    if (!validTypes.includes(this.requestType)) {
      errors.push("Invalid request type");
    }

    const validStatuses = ["Chờ duyệt", "Đã duyệt", "Từ chối"];
    if (!validStatuses.includes(this.status)) {
      errors.push("Invalid status");
    }

    const validApproverRoles = ["Manager", "Admin"];
    if (!validApproverRoles.includes(this.approverRole)) {
      errors.push("Invalid approver role");
    }

    if (
      this.status === "Từ chối" &&
      (!this.rejectionReason || this.rejectionReason.length < 5)
    ) {
      errors.push(
        "Rejection reason is required and must be at least 5 characters"
      );
    }

    return errors;
  }

  // Convert to plain object for serialization
  toJSON() {
    return { ...this };
  }
}

module.exports = Request;
