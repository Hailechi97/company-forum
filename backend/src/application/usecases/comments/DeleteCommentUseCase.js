class DeleteCommentUseCase {
  constructor(postRepository, userRepository) {
    this.postRepository = postRepository;
    this.userRepository = userRepository;
  }

  async execute(commentId, userId) {
    try {
      // Check if comment exists
      const comment = await this.postRepository.findCommentById(commentId);
      if (!comment) {
        throw new Error("Bình luận không tồn tại");
      }

      // Check if user exists
      const user = await this.userRepository.findByEmpId(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // Check permissions
      const canDelete = this.canDeleteComment(comment, user);
      if (!canDelete) {
        throw new Error("Bạn không có quyền xóa bình luận này");
      }

      // Delete comment
      await this.postRepository.deleteComment(commentId);

      return {
        success: true,
        message: "Đã xóa bình luận thành công",
      };
    } catch (error) {
      console.error("DeleteCommentUseCase error:", error);
      throw error;
    }
  }

  canDeleteComment(comment, user) {
    // Trưởng phòng (Manager) có thể xóa all bình luận
    if (user.chucVu === "Trưởng phòng" || user.chucVu === "Manager") {
      return true;
    }

    // Admin có thể xóa all bình luận
    if (user.chucVu === "Admin") {
      return true;
    }

    // Nhân viên chỉ được xóa bình luận của chính mình
    if (comment.author.id === user.empID) {
      return true;
    }

    return false;
  }
}

module.exports = DeleteCommentUseCase;
