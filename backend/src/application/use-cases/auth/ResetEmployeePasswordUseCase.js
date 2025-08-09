// Use Case: Reset Single Employee Password (Manager only)
const bcrypt = require("bcrypt");

class ResetEmployeePasswordUseCase {
  constructor(employeeRepository, mailService) {
    this.employeeRepository = employeeRepository;
    this.mailService = mailService;
  }

  async execute(requestingUser, targetEmpId) {
    // Debug log để xem cấu trúc user
    console.log(
      "ResetEmployeePasswordUseCase - requestingUser:",
      JSON.stringify(requestingUser, null, 2)
    );

    // Authorization check - only Manager can reset employee passwords
    if (!this.isAuthorized(requestingUser)) {
      throw new Error(
        "Chỉ trưởng phòng mới có quyền cấp lại mật khẩu cho nhân viên"
      );
    }

    // Find target employee
    console.log(
      "ResetEmployeePasswordUseCase - Looking for employee with EmpID:",
      targetEmpId
    );
    const targetEmployee = await this.employeeRepository.findByEmpId(
      targetEmpId
    );
    console.log(
      "ResetEmployeePasswordUseCase - Found employee:",
      JSON.stringify(targetEmployee, null, 2)
    );

    if (!targetEmployee) {
      throw new Error("Không tìm thấy nhân viên");
    }

    // Don't allow resetting own password through this method
    if (targetEmployee.empId === requestingUser.empID) {
      throw new Error(
        "Không thể cấp lại mật khẩu cho chính mình. Vui lòng sử dụng chức năng đổi mật khẩu."
      );
    }

    try {
      // Generate new temporary password
      const tempPassword = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Update password in database
      await this.employeeRepository.updatePassword(
        targetEmployee.empId,
        hashedPassword
      );

      // Send email with new password
      if (targetEmployee.email) {
        await this.mailService.sendPasswordReset({
          to: targetEmployee.email,
          firstName: targetEmployee.firstName,
          lastName: targetEmployee.lastName,
          tempPassword: tempPassword,
          department: targetEmployee.department,
          resetBy: `${requestingUser.firstName} ${requestingUser.lastName}`, // Ai cấp lại
        });
      }

      return {
        success: true,
        message: `Đã cấp lại mật khẩu cho nhân viên ${targetEmployee.fullName}`,
        empId: targetEmployee.empId,
        fullName: targetEmployee.fullName,
        email: targetEmployee.email,
        tempPassword: tempPassword, // Chỉ để log, không trả về frontend
      };
    } catch (error) {
      throw new Error(`Không thể cấp lại mật khẩu: ${error.message}`);
    }
  }

  isAuthorized(user) {
    console.log("isAuthorized check:", {
      "user.role": user?.role,
      "user.position": user?.position,
    });

    return (
      user &&
      (user.role === "Manager" ||
        user.role === "Admin" ||
        user.position === "Trưởng phòng")
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

module.exports = ResetEmployeePasswordUseCase;
