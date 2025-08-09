const Request = require("../../../domain/entities/Request");

class RequestRepository {
  constructor(db) {
    this.db = db;
  }

  // Map database row to Request entity
  mapRowToEntity(row) {
    return new Request({
      requestId: row.requestId,
      empId: row.empId,
      requestType: row.requestType,
      title: row.title,
      content: row.content,
      attachedFile: row.attachedFile,
      requestDate: row.requestDate,
      status: row.status,
      approvedBy: row.approvedBy,
      approvedDate: row.approvedDate,
      approverRole: row.approverRole,
      rejectionReason: row.rejectionReason,
      // Additional fields from joins
      employeeName: row.employeeName,
      employeeDepartment: row.employeeDepartment,
      approverName: row.approverName,
    });
  }

  // Get requests by employee
  async findByEmployeeId(empId, limit = 20, offset = 0) {
    try {
      const sql = `
        SELECT
          r.RequestID as requestId,
          r.EmpID as empId,
          r.RequestType as requestType,
          r.Content as content,
          r.AttachedFile as attachedFile,
          r.RequestDate as requestDate,
          r.Status as status,
          r.ApprovedBy as approvedBy,
          r.ApprovedDate as approvedDate,
          r.ApproverRole as approverRole,
          r.RejectionReason as rejectionReason,
          CONCAT(e.FirstName, ' ', e.LastName) as employeeName,
          e.Department as employeeDepartment,
          CONCAT(a.FirstName, ' ', a.LastName) as approverName
        FROM Requests r
        LEFT JOIN Employees e ON r.EmpID = e.EmpID
        LEFT JOIN Employees a ON r.ApprovedBy = a.EmpID
        WHERE r.EmpID = ?
        ORDER BY r.RequestDate DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      console.log("RequestRepository.findByEmployeeId SQL:", sql);
      console.log("Parameters:", [empId]);

      const rows = await this.db.query(sql, [empId]);
      return rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      console.error("Database query error:", error);
      return [];
    }
  }

  // Get requests for approval (by department for managers)
  async findForApproval(userRole, userDepartment, limit = 20, offset = 0) {
    try {
      let sql = `
        SELECT 
          r.RequestID as requestId,
          r.EmpID as empId,
          r.RequestType as requestType,
          r.Content as content,
          r.AttachedFile as attachedFile,
          r.RequestDate as requestDate,
          r.Status as status,
          r.ApprovedBy as approvedBy,
          r.ApprovedDate as approvedDate,
          r.ApproverRole as approverRole,
          r.RejectionReason as rejectionReason,
          CONCAT(e.FirstName, ' ', e.LastName) as employeeName,
          e.Department as employeeDepartment,
          CONCAT(a.FirstName, ' ', a.LastName) as approverName
        FROM Requests r
        LEFT JOIN Employees e ON r.EmpID = e.EmpID
        LEFT JOIN Employees a ON r.ApprovedBy = a.EmpID
        WHERE r.Status = 'Chờ duyệt'
      `;

      const params = [];

      if (userRole === "Manager") {
        sql += " AND e.Department = ?";
        params.push(userDepartment);
      }
      // Admin can see all pending requests

      sql += ` ORDER BY r.RequestDate ASC LIMIT ${limit} OFFSET ${offset}`;

      console.log("RequestRepository.findForApproval SQL:", sql);
      console.log("Parameters:", params);

      const rows = await this.db.query(sql, params);
      return rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      console.error("Database query error:", error);
      return [];
    }
  }

  // Find request by ID with full details
  async findById(requestId) {
    try {
      const sql = `
        SELECT 
          r.RequestID as requestId,
          r.EmpID as empId,
          r.RequestType as requestType,
          
          r.Content as content,
          r.AttachedFile as attachedFile,
          r.RequestDate as requestDate,
          r.Status as status,
          r.ApprovedBy as approvedBy,
          r.ApprovedDate as approvedDate,
          r.ApproverRole as approverRole,
          r.RejectionReason as rejectionReason,
          CONCAT(e.FirstName, ' ', e.LastName) as employeeName,
          e.Department as employeeDepartment,
          CONCAT(a.FirstName, ' ', a.LastName) as approverName
        FROM Requests r
        LEFT JOIN Employees e ON r.EmpID = e.EmpID
        LEFT JOIN Employees a ON r.ApprovedBy = a.EmpID
        WHERE r.RequestID = ?
      `;

      const rows = await this.db.query(sql, [requestId]);
      return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
    } catch (error) {
      console.error("Database query error:", error);
      return null;
    }
  }

  // Create new request
  async create(request) {
    try {
      // Format datetime for MySQL
      const formatDateTimeForMySQL = (dateTime) => {
        const date = new Date(dateTime);
        return date.toISOString().slice(0, 19).replace("T", " ");
      };

      const sql = `
        INSERT INTO Requests (EmpID, RequestType, Title, Content, AttachedFile, RequestDate, Status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        request.empId,
        request.requestType,
        request.title,
        request.content,
        request.attachedFile,
        formatDateTimeForMySQL(request.requestDate),
        request.status || "Chờ duyệt",
      ];

      console.log("Create request params:", params);
      const result = await this.db.query(sql, params);
      return result.insertId;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Update request (for editing)
  async update(requestId, updateData) {
    try {
      const sql = `
        UPDATE Requests 
        SET Title = ?, Content = ?, AttachedFile = ?
        WHERE RequestID = ? AND Status = 'Chờ duyệt'
      `;

      const params = [
        updateData.title,
        updateData.content,
        updateData.attachedFile,
        requestId,
      ];

      const result = await this.db.query(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Approve request
  async approve(requestId, approvedBy, approverRole) {
    try {
      const formatDateTimeForMySQL = (dateTime) => {
        const date = new Date(dateTime);
        return date.toISOString().slice(0, 19).replace("T", " ");
      };

      const sql = `
        UPDATE Requests 
        SET Status = 'Đã duyệt', ApprovedBy = ?, ApprovedDate = ?, ApproverRole = ?
        WHERE RequestID = ?
      `;

      const params = [
        approvedBy,
        formatDateTimeForMySQL(new Date()),
        approverRole,
        requestId,
      ];

      const result = await this.db.query(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Reject request
  async reject(requestId, rejectionReason, approvedBy, approverRole) {
    try {
      const formatDateTimeForMySQL = (dateTime) => {
        const date = new Date(dateTime);
        return date.toISOString().slice(0, 19).replace("T", " ");
      };

      const sql = `
        UPDATE Requests 
        SET Status = 'Từ chối', RejectionReason = ?, ApprovedBy = ?, ApprovedDate = ?, ApproverRole = ?
        WHERE RequestID = ?
      `;

      const params = [
        rejectionReason,
        approvedBy,
        formatDateTimeForMySQL(new Date()),
        approverRole,
        requestId,
      ];

      const result = await this.db.query(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Delete request (only if pending)
  async delete(requestId) {
    try {
      const sql = `DELETE FROM Requests WHERE RequestID = ? AND Status = 'Chờ duyệt'`;
      const result = await this.db.query(sql, [requestId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Get request statistics
  async getStatistics(empId = null, department = null) {
    try {
      let sql = `
        SELECT 
          r.Status,
          COUNT(*) as count
        FROM Requests r
        LEFT JOIN Employees e ON r.EmpID = e.EmpID
        WHERE 1=1
      `;

      const params = [];

      if (empId) {
        sql += " AND r.EmpID = ?";
        params.push(empId);
      }

      if (department) {
        sql += " AND e.Department = ?";
        params.push(department);
      }

      sql += " GROUP BY r.Status";

      const rows = await this.db.query(sql, params);
      return rows;
    } catch (error) {
      console.error("Database query error:", error);
      return [];
    }
  }
}

module.exports = RequestRepository;
