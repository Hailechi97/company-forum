class LikePostUseCase {
  constructor(postRepository, userRepository) {
    this.postRepository = postRepository;
    this.userRepository = userRepository;
  }

  async execute(postId, userId, isLike = true) {
    try {
      // Check if post exists
      const post = await this.postRepository.findById(postId);
      if (!post) {
        throw new Error("Bài viết không tồn tại");
      }

      // Check if user exists
      const user = await this.userRepository.findByEmpId(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      // Check if user already liked/disliked this post
      const existingReaction = await this.postRepository.findUserReaction(
        postId,
        userId
      );

      if (existingReaction) {
        // If same reaction, remove it (toggle off)
        if (existingReaction.LikeStatus === isLike) {
          await this.postRepository.removeReaction(postId, userId);
          await this.postRepository.updateReactionCounts(postId);
          return {
            success: true,
            message: isLike ? "Đã bỏ thích" : "Đã bỏ không thích",
            action: "removed",
          };
        } else {
          // Different reaction, update it
          await this.postRepository.updateReaction(postId, userId, isLike);
          await this.postRepository.updateReactionCounts(postId);
          return {
            success: true,
            message: isLike ? "Đã thích bài viết" : "Đã không thích bài viết",
            action: "updated",
          };
        }
      } else {
        // No existing reaction, create new one
        await this.postRepository.addReaction(postId, userId, isLike);
        await this.postRepository.updateReactionCounts(postId);
        return {
          success: true,
          message: isLike ? "Đã thích bài viết" : "Đã không thích bài viết",
          action: "added",
        };
      }
    } catch (error) {
      console.error("LikePostUseCase error:", error);
      throw error;
    }
  }
}

module.exports = LikePostUseCase;
