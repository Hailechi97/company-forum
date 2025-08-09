// Use Case: Reset All Passwords (Manager only)
const bcrypt = require("bcrypt");

class ResetAllPasswordsUseCase {
  constructor(employeeRepository, mailService) {
    this.employeeRepository = employeeRepository;
    this.mailService = mailService;
  }

  async execute(requestingUser) {
    // Authorization check - only Manager can reset all passwords
    if (!this.isAuthorized(requestingUser)) {
      throw new Error(
        "Chỉ trưởng phòng mới có quyền cấp lại mật khẩu cho toàn bộ nhân viên"
      );
    }

    // Get all employees except the requesting manager
    const allEmployees = await this.employeeRepository.findAll();
    const employeesToReset = allEmployees.filter(
      (emp) => emp.empId !== requestingUser.empID
    );

    if (employeesToReset.length === 0) {
      throw new Error("Không có nhân viên nào để cấp lại mật khẩu");
    }

    const results = [];
    const errors = [];

    // Reset password for each employee
    for (const employee of employeesToReset) {
      try {
        const tempPassword = this.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Update password in database
        await this.employeeRepository.updatePassword(
          employee.empId,
          hashedPassword
        );

        // Send email with new password
        if (employee.email) {
          await this.mailService.sendPasswordReset({
            to: employee.email,
            firstName: employee.firstName,
            lastName: employee.lastName,
            tempPassword: tempPassword,
            department: employee.department,
          });
        }

        results.push({
          empId: employee.empId,
          fullName: employee.fullName,
          email: employee.email,
          success: true,
          tempPassword: tempPassword, // Chỉ để log, không trả về frontend
        });
      } catch (error) {
        errors.push({
          empId: employee.empId,
          fullName: employee.fullName,
          error: error.message,
        });
      }
    }

    return {
      message: `Đã cấp lại mật khẩu cho ${results.length}/${employeesToReset.length} nhân viên`,
      successCount: results.length,
      errorCount: errors.length,
      totalEmployees: employeesToReset.length,
      results: results.map((r) => ({
        empId: r.empId,
        fullName: r.fullName,
        email: r.email,
        success: r.success,
      })), // Không trả về password
      errors: errors,
    };
  }

  isAuthorized(user) {
    return (
      user &&
      (user.role === "Manager" ||
        user.employee?.chucVu === "Trưởng phòng" ||
        user.chucVu === "Trưởng phòng")
    );
  }

  generateRandomPassword() {
    // Generate a more secure random password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

module.exports = ResetAllPasswordsUseCase;
