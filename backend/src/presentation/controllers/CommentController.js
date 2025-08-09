const CreateCommentUseCase = require("../../application/usecases/comments/CreateCommentUseCase");
const GetCommentsUseCase = require("../../application/usecases/comments/GetCommentsUseCase");
const DeleteCommentUseCase = require("../../application/usecases/comments/DeleteCommentUseCase");

class CommentController {
  constructor(postRepository, userRepository) {
    this.createCommentUseCase = new CreateCommentUseCase(
      postRepository,
      userRepository
    );
    this.getCommentsUseCase = new GetCommentsUseCase(postRepository);
    this.deleteCommentUseCase = new DeleteCommentUseCase(
      postRepository,
      userRepository
    );
  }

  async createComment(req, res) {
    try {
      const { postId } = req.params;
      const { content, imageURL, parentCommentId } = req.body;
      const userId = req.user.userId;

      const commentData = {
        postId: parseInt(postId),
        content,
        imageURL,
        parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
      };

      const result = await this.createCommentUseCase.execute(
        commentData,
        userId
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi hệ thống, vui lòng thử lại",
      });
    }
  }

  async getComments(req, res) {
    try {
      const { postId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await this.getCommentsUseCase.execute(parseInt(postId), {
        page,
        limit,
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi hệ thống, vui lòng thử lại",
      });
    }
  }

  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.userId;

      const result = await this.deleteCommentUseCase.execute(
        parseInt(commentId),
        userId
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json({ success: false, message: result.error });
      }
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi hệ thống, vui lòng thử lại",
      });
    }
  }
}

module.exports = CommentController;
