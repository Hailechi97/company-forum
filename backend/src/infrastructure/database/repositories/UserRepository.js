const bcrypt = require("bcrypt");

class UserRepository {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  async findByEmail(email) {
    const sql = `
      SELECT 
        u.UserID as id,
        u.EmpID,
        e.FirstName,
        e.LastName,
        e.Email,
        u.PasswordHash as password,
        u.Role,
        e.Photo,
        e.Department,
        e.ChucVu,
        e.Status,
        e.Telephone,
        e.Address_loc,
        e.Birthdate,
        e.NgayThamGia
      FROM Users u
      JOIN Employees e ON u.EmpID = e.EmpID
      WHERE u.Email = ? AND e.Status = 'Hoạt động'
    `;

    const rows = await this.db.query(sql, [email]);

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0], true);
  }

  async findById(id) {
    const sql = `
      SELECT 
        u.UserID as id,
        u.EmpID,
        e.FirstName,
        e.LastName,
        e.Email,
        u.Role,
        e.Photo,
        e.Department,
        e.ChucVu,
        e.Status,
        e.Telephone,
        e.Address_loc,
        e.Birthdate,
        e.NgayThamGia
      FROM Users u
      JOIN Employees e ON u.EmpID = e.EmpID
      WHERE u.UserID = ? AND e.Status = 'Hoạt động'
    `;

    const rows = await this.db.query(sql, [id]);

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0]);
  }

  async findByEmpId(empId) {
    const sql = `
      SELECT 
        u.UserID as id,
        u.EmpID,
        e.FirstName,
        e.LastName,
        e.Email,
        u.Role,
        e.Photo,
        e.Department,
        e.ChucVu,
        e.Status,
        e.Telephone,
        e.Address_loc,
        e.Birthdate,
        e.NgayThamGia
      FROM Users u
      JOIN Employees e ON u.EmpID = e.EmpID
      WHERE u.EmpID = ? AND e.Status = 'Hoạt động'
    `;

    const rows = await this.db.query(sql, [empId]);

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0]);
  }

  async verifyPassword(plainPassword, hashedPassword) {
    // Since your database uses simple password '1', we'll handle both cases
    if (hashedPassword === "1") {
      return plainPassword === "1";
    }
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateLastLogin(userId) {
    // Note: Your Users table doesn't have last_login column, so this might be optional
    // const sql = `UPDATE Users SET last_login = NOW() WHERE UserID = ?`;
    // return this.db.query(sql, [userId]);
    return true; // Skip for now since column doesn't exist
  }

  mapRowToEntity(row, includePassword = false) {
    const user = {
      id: row.id,
      empId: row.EmpID,
      firstName: row.FirstName,
      lastName: row.LastName,
      email: row.Email,
      role: row.Role,
      photo: row.Photo,
      department: row.Department,
      position: row.ChucVu,
      status: row.Status,
      telephone: row.Telephone,
      address: row.Address_loc,
      birthdate: row.Birthdate,
      joinDate: row.NgayThamGia,
      fullName: `${row.FirstName} ${row.LastName}`,
    };

    if (includePassword && row.password) {
      user.password = row.password;
    }

    return user;
  }

  async findAll(options = {}) {
    const { page = 1, limit = 20, department, role, search } = options;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        u.UserID as id,
        u.EmpID,
        e.FirstName,
        e.LastName,
        e.Email,
        u.Role,
        e.Photo,
        e.Department,
        e.ChucVu,
        e.Status,
        e.Telephone,
        e.Address_loc,
        e.Birthdate,
        e.NgayThamGia
      FROM Users u
      JOIN Employees e ON u.EmpID = e.EmpID
      WHERE e.Status = 'Hoạt động'
    `;

    const params = [];

    if (department) {
      sql += " AND e.Department = ?";
      params.push(department);
    }

    if (role) {
      sql += " AND u.Role = ?";
      params.push(role);
    }

    if (search) {
      sql += " AND (e.FirstName LIKE ? OR e.LastName LIKE ? OR e.Email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY e.FirstName, e.LastName LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = await this.db.query(sql, params);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findByDepartment(department) {
    const sql = `
      SELECT 
        u.UserID as id,
        u.EmpID,
        e.FirstName,
        e.LastName,
        e.Email,
        u.Role,
        e.Photo,
        e.Department,
        e.ChucVu,
        e.Status,
        e.Telephone,
        e.Address_loc,
        e.Birthdate,
        e.NgayThamGia
      FROM Users u
      JOIN Employees e ON u.EmpID = e.EmpID
      WHERE e.Department = ? AND e.Status = 'Hoạt động'
      ORDER BY e.FirstName, e.LastName
    `;

    const rows = await this.db.query(sql, [department]);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async updateUser(empId, updateData) {
    try {
      console.log("UserRepository.updateUser called with:", {
        empId,
        updateData,
      }); // Debug log

      // Update Employee table
      if (
        updateData.firstName ||
        updateData.lastName ||
        updateData.email ||
        updateData.photo ||
        updateData.telephone ||
        updateData.address
      ) {
        const employeeFields = [];
        const employeeParams = [];

        if (updateData.firstName) {
          employeeFields.push("FirstName = ?");
          employeeParams.push(updateData.firstName);
        }
        if (updateData.lastName) {
          employeeFields.push("LastName = ?");
          employeeParams.push(updateData.lastName);
        }
        if (updateData.email) {
          employeeFields.push("Email = ?");
          employeeParams.push(updateData.email);
        }
        if (updateData.photo) {
          employeeFields.push("Photo = ?");
          employeeParams.push(updateData.photo);
          console.log("Photo field being updated to:", updateData.photo); // Debug log
        }
        if (updateData.telephone) {
          employeeFields.push("Telephone = ?");
          employeeParams.push(updateData.telephone);
        }
        if (updateData.address) {
          employeeFields.push("Address_loc = ?");
          employeeParams.push(updateData.address);
        }
        if (updateData.position) {
          employeeFields.push("ChucVu = ?");
          employeeParams.push(updateData.position);
        }
        if (updateData.status) {
          employeeFields.push("Status = ?");
          employeeParams.push(updateData.status);
        }

        if (employeeFields.length > 0) {
          employeeParams.push(empId);
          const employeeSql = `UPDATE Employees SET ${employeeFields.join(
            ", "
          )} WHERE EmpID = ?`;
          console.log("Executing SQL:", employeeSql); // Debug log
          console.log("With params:", employeeParams); // Debug log
          const result = await this.db.query(employeeSql, employeeParams);
          console.log("SQL result:", result); // Debug log
        }
      }

      // Update Users table
      if (updateData.role || updateData.password) {
        const userFields = [];
        const userParams = [];

        if (updateData.role) {
          userFields.push("Role = ?");
          userParams.push(updateData.role);
        }
        if (updateData.password) {
          const hashedPassword = await bcrypt.hash(updateData.password, 10);
          userFields.push("PasswordHash = ?");
          userParams.push(hashedPassword);
        }

        if (userFields.length > 0) {
          userParams.push(empId);
          const userSql = `UPDATE Users SET ${userFields.join(
            ", "
          )} WHERE EmpID = ?`;
          await this.db.query(userSql, userParams);
        }
      }

      return this.findByEmpId(empId);
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  }

  async deleteUser(empId) {
    try {
      // Set status to inactive instead of deleting
      const sql = `UPDATE Employees SET Status = 'Không hoạt động' WHERE EmpID = ?`;
      await this.db.query(sql, [empId]);
      return true;
    } catch (error) {
      console.error("Delete user error:", error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      // Generate new EmpID
      const lastEmpSql = `SELECT EmpID FROM Employees ORDER BY EmpID DESC LIMIT 1`;
      const lastEmpRows = await this.db.query(lastEmpSql);
      let newEmpId = "E001";

      if (lastEmpRows.length > 0) {
        const lastId = lastEmpRows[0].EmpID;
        const numPart = parseInt(lastId.substring(1)) + 1;
        newEmpId = "E" + numPart.toString().padStart(3, "0");
      }

      // Insert into Employees table
      const employeeSql = `
        INSERT INTO Employees (EmpID, FirstName, LastName, Email, Photo, Department, ChucVu, Status, Telephone, Address_loc)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Hoạt động', ?, ?)
      `;

      await this.db.query(employeeSql, [
        newEmpId,
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.photo || null,
        userData.department,
        userData.position || "Nhân viên",
        userData.telephone || null,
        userData.address || null,
      ]);

      // Insert into Users table
      const defaultPassword = await bcrypt.hash("123456", 10); // Default password
      const userSql = `
        INSERT INTO Users (EmpID, Email, PasswordHash, Role)
        VALUES (?, ?, ?, ?)
      `;

      await this.db.query(userSql, [
        newEmpId,
        userData.email,
        defaultPassword,
        userData.role || "Employee",
      ]);

      return this.findByEmpId(newEmpId);
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  }
}

module.exports = UserRepository;
