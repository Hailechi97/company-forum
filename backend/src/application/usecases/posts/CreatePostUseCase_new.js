class CreatePostUseCase {
  constructor(postRepository, userRepository) {
    this.postRepository = postRepository;
    this.userRepository = userRepository;
  }

  async execute(postData, authorId) {
    try {
      // Validation
      if (!postData.title || !postData.content) {
        return {
          success: false,
          error: "Tiêu đề và nội dung không được để trống",
        };
      }

      // Verify author exists
      const author = await this.userRepository.findByEmpId(authorId);
      if (!author) {
        return {
          success: false,
          error: "Người dùng không tồn tại",
        };
      }

      const newPostData = {
        authorId,
        title: postData.title.trim(),
        content: postData.content.trim(),
        imageURL: postData.imageURL || null,
      };

      const post = await this.postRepository.create(newPostData);

      return {
        success: true,
        data: post,
        message: "Đăng bài thành công",
      };
    } catch (error) {
      console.error("Create post error:", error);
      return {
        success: false,
        error: "Lỗi hệ thống, vui lòng thử lại",
      };
    }
  }
}

module.exports = CreatePostUseCase;
