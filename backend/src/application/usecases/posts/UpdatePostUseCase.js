class UpdatePostUseCase {
  constructor(postRepository, userRepository) {
    this.postRepository = postRepository;
    this.userRepository = userRepository;
  }

  async execute(postId, updateData, userId) {
    try {
      // Get the post to check ownership
      const post = await this.postRepository.findById(postId);
      if (!post) {
        throw new Error("Bài viết không tồn tại");
      }

      // Get user information to check permissions
      const user = await this.userRepository.findByEmpId(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // Check permissions: Only post owner can edit their post
      if (post.EmpID !== user.EmpID) {
        throw new Error("Bạn chỉ có thể chỉnh sửa bài viết của chính mình");
      }

      // Validate update data
      if (updateData.title && updateData.title.trim().length === 0) {
        throw new Error("Tiêu đề không được để trống");
      }

      if (updateData.content && updateData.content.trim().length === 0) {
        throw new Error("Nội dung không được để trống");
      }

      // Prepare update data
      const dataToUpdate = {
        ...updateData,
        // Ensure we don't update sensitive fields
        PostID: undefined,
        EmpID: undefined,
        PostedDate: undefined,
        Views: undefined,
        Likes: undefined,
        Dislikes: undefined,
      };

      // Update the post
      const updatedPost = await this.postRepository.update(
        postId,
        dataToUpdate
      );

      return {
        success: true,
        message: "Cập nhật bài viết thành công",
        data: updatedPost,
      };
    } catch (error) {
      console.error("UpdatePostUseCase error:", error);
      throw error;
    }
  }
}

module.exports = UpdatePostUseCase;
