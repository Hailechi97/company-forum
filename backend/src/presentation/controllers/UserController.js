class UserController {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  // Get user profile (for current user)
  async getProfile(req, res) {
    try {
      const userId = req.user.empId;
      const user = await this.userRepository.findByEmpId(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      // Remove sensitive data
      const { password, ...userProfile } = user;

      res.json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin người dùng",
      });
    }
  }

  // Get users by department (for managers only)
  async getUsersByDepartment(req, res) {
    try {
      const { department } = req.params;
      const currentUser = req.user;

      // Check if user is manager
      if (
        currentUser.role !== "Manager" &&
        !currentUser.position?.includes("Trưởng phòng")
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem danh sách này",
        });
      }

      // Check if requesting users from their own department
      if (currentUser.department !== department) {
        return res.status(403).json({
          success: false,
          message: "Bạn chỉ có thể xem nhân viên trong phòng ban của mình",
        });
      }

      const users = await this.userRepository.findByDepartment(department);

      // Remove sensitive data
      const safeUsers = users.map((user) => {
        const { password, ...safeUser } = user;
        return safeUser;
      });

      res.json({
        success: true,
        data: safeUsers,
      });
    } catch (error) {
      console.error("Get users by department error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách người dùng",
      });
    }
  }

  // Get user by ID (for managers or the user themselves)
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Get target user
      const targetUser = await this.userRepository.findByEmpId(id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      // Check permissions
      if (currentUser.empId === id) {
        // User viewing their own profile - allowed
      } else if (
        currentUser.role === "Manager" &&
        currentUser.department === targetUser.department
      ) {
        // Manager viewing user in their department - allowed
      } else {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem thông tin này",
        });
      }

      // Remove sensitive data
      const { password, ...safeUser } = targetUser;

      res.json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin người dùng",
      });
    }
  }

  // Update user (managers can update users in their department)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      const updateData = req.body;

      console.log("Update user request:", { id, updateData }); // Debug log

      // Get target user
      const targetUser = await this.userRepository.findByEmpId(id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      // Check permissions
      if (currentUser.empId === id) {
        // User updating their own profile - allowed
      } else if (
        currentUser.role === "Manager" &&
        currentUser.department === targetUser.department
      ) {
        // Manager updating user in their department - allowed
      } else {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật người dùng này",
        });
      }

      const updatedUser = await this.userRepository.updateUser(id, updateData);

      // Remove sensitive data
      const { password, ...safeUser } = updatedUser;

      res.json({
        success: true,
        message: "Cập nhật thành công",
        data: safeUser,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật người dùng",
      });
    }
  }

  // Delete user (managers only, in their department)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Only managers can delete users
      if (
        currentUser.role !== "Manager" &&
        !currentUser.position?.includes("Trưởng phòng")
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xóa người dùng",
        });
      }

      // Get target user
      const targetUser = await this.userRepository.findByEmpId(id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      // Check if user is in same department
      if (currentUser.department !== targetUser.department) {
        return res.status(403).json({
          success: false,
          message: "Bạn chỉ có thể xóa nhân viên trong phòng ban của mình",
        });
      }

      // Prevent self-deletion
      if (currentUser.empId === id) {
        return res.status(400).json({
          success: false,
          message: "Bạn không thể xóa tài khoản của chính mình",
        });
      }

      await this.userRepository.deleteUser(id);

      res.json({
        success: true,
        message: "Xóa người dùng thành công",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa người dùng",
      });
    }
  }

  // Create user (managers only, in their department)
  async createUser(req, res) {
    try {
      const currentUser = req.user;
      const userData = req.body;

      // Only managers can create users
      if (
        currentUser.role !== "Manager" &&
        !currentUser.position?.includes("Trưởng phòng")
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền tạo người dùng",
        });
      }

      // Set department to manager's department
      userData.department = currentUser.department;

      const newUser = await this.userRepository.createUser(userData);

      // Remove sensitive data
      const { password, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        message: "Tạo người dùng thành công",
        data: safeUser,
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo người dùng",
      });
    }
  }
}

module.exports = UserController;
