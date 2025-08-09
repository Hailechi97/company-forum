class GetPostsUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(options = {}) {
    try {
      console.log("GetPostsUseCase - options:", options);
      const posts = await this.postRepository.findAll(options);
      console.log("GetPostsUseCase - posts count:", posts.length);

      return {
        success: true,
        data: {
          posts,
          pagination: {
            page: parseInt(options.page) || 1,
            limit: parseInt(options.limit) || 20,
            total: posts.length,
          },
        },
      };
    } catch (error) {
      console.error("Get posts error:", error);
      return {
        success: false,
        error: "Lỗi hệ thống, vui lòng thử lại",
      };
    }
  }

  async executeGetById(postId, viewerId = null) {
    try {
      const post = await this.postRepository.findById(postId);

      if (!post) {
        return {
          success: false,
          error: "Bài viết không tồn tại",
        };
      }

      // Increment view count
      await this.postRepository.incrementViews(postId);

      // Get comments for the post
      const comments = await this.postRepository.getCommentsForPost(postId);
      post.comments = comments;

      return {
        success: true,
        data: post,
      };
    } catch (error) {
      console.error("Get post by ID error:", error);
      return {
        success: false,
        error: "Lỗi hệ thống, vui lòng thử lại",
      };
    }
  }
}

module.exports = GetPostsUseCase;
