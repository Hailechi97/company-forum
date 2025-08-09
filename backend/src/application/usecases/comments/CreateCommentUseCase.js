class CreateCommentUseCase {
  constructor(postRepository, userRepository) {
    this.postRepository = postRepository;
    this.userRepository = userRepository;
  }

  async execute(commentData, userId) {
    try {
      // Validate required fields
      if (!commentData.postId) {
        throw new Error("PostID là bắt buộc");
      }

      if (!commentData.content || commentData.content.trim().length === 0) {
        throw new Error("Nội dung bình luận không được để trống");
      }

      // Check if post exists and allows comments
      const post = await this.postRepository.findById(commentData.postId);
      if (!post) {
        throw new Error("Bài viết không tồn tại");
      }

      if (!post.AllowComments) {
        throw new Error("Bài viết này không cho phép bình luận");
      }

      // Check if user exists
      const user = await this.userRepository.findByEmpId(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // If it's a reply, check if parent comment exists
      if (commentData.parentCommentId) {
        const parentComment = await this.postRepository.findCommentById(
          commentData.parentCommentId
        );
        if (!parentComment) {
          throw new Error("Bình luận gốc không tồn tại");
        }
      }

      // Create comment
      const comment = await this.postRepository.createComment({
        PostID: commentData.postId,
        EmpID: userId,
        Content: commentData.content.trim(),
        ImageURL: commentData.imageURL || null,
        ParentCommentID: commentData.parentCommentId || null,
        CommentDate: new Date(),
      });

      return {
        success: true,
        message: "Thêm bình luận thành công",
        data: comment,
      };
    } catch (error) {
      console.error("CreateCommentUseCase error:", error);
      throw error;
    }
  }
}

module.exports = CreateCommentUseCase;
