const express = require("express");
const CommentController = require("../controllers/CommentController");

const createCommentRoutes = (postRepository, userRepository) => {
  const router = express.Router();
  const commentController = new CommentController(
    postRepository,
    userRepository
  );

  // Import auth middleware
  const { authMiddleware } = require("../middleware/authMiddleware");
  const authMw = authMiddleware(userRepository);

  // Get comments for a post
  router.get("/posts/:postId/comments", async (req, res) => {
    await commentController.getComments(req, res);
  });

  // Create new comment
  router.post("/posts/:postId/comments", authMw, async (req, res) => {
    await commentController.createComment(req, res);
  });

  // Delete comment
  router.delete("/comments/:commentId", authMw, async (req, res) => {
    await commentController.deleteComment(req, res);
  });

  return router;
};

module.exports = createCommentRoutes;
