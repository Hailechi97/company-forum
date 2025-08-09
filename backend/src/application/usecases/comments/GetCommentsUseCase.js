class GetCommentsUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(postId, options = {}) {
    try {
      // Check if post exists
      const post = await this.postRepository.findById(postId);
      if (!post) {
        throw new Error("Bài viết không tồn tại");
      }

      // Get comments for the post
      const comments = await this.postRepository.getCommentsForPost(
        postId,
        options
      );

      return {
        success: true,
        data: {
          comments,
          pagination: {
            page: parseInt(options.page) || 1,
            limit: parseInt(options.limit) || 20,
            total: comments.length,
          },
        },
      };
    } catch (error) {
      console.error("GetCommentsUseCase error:", error);
      return {
        success: false,
        error: "Lỗi hệ thống, vui lòng thử lại",
      };
    }
  }
}

module.exports = GetCommentsUseCase;
