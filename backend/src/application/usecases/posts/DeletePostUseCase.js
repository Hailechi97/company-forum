class DeletePostUseCase {
  constructor(postRepository, userRepository) {
    this.postRepository = postRepository;
    this.userRepository = userRepository;
  }

  async execute(postId, userId) {
    try {
      // Get the post to check ownership and permissions
      const post = await this.postRepository.findById(postId);
      if (!post) {
        throw new Error("Bài viết không tồn tại");
      }

      // Get user information to check permissions
      const user = await this.userRepository.findByEmpId(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // Check permissions:
      // 1. Admin can delete any post
      // 2. Manager (Trưởng Phòng) can delete any post
      // 3. Employee with CapBac A1 can delete any post
      // 4. Post owner can delete their own post
      const canDelete = this.checkDeletePermission(post, user);

      if (!canDelete) {
        throw new Error("Bạn không có quyền xóa bài viết này");
      }

      // Delete the post
      await this.postRepository.delete(postId);

      return {
        success: true,
        message: "Xóa bài viết thành công",
      };
    } catch (error) {
      console.error("DeletePostUseCase error:", error);
      throw error;
    }
  }

  checkDeletePermission(post, user) {
    // Admin can delete any post
    if (user.Role === "Admin") {
      return true;
    }

    // Manager (Trưởng Phòng) can delete any post
    if (user.Role === "Manager") {
      return true;
    }

    // Employee with CapBac A1 can delete any post
    if (user.Employee && user.Employee.CapBac === "A1") {
      return true;
    }

    // Post owner can delete their own post
    if (post.EmpID === user.EmpID) {
      return true;
    }

    return false;
  }
}

module.exports = DeletePostUseCase;
