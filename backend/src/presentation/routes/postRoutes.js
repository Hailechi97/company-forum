const express = require("express");
const router = express.Router();

// This will be injected by dependency injection container
let postController;
let authMiddleware;

// Initialize with controller and middleware
const initializeRoutes = (controller, authMw = null) => {
  postController = controller;
  authMiddleware = authMw;
};

// Routes
// Protected route - create post (needs auth)
router.post(
  "/",
  (req, res, next) => {
    if (authMiddleware) {
      authMiddleware(req, res, next);
    } else {
      next();
    }
  },
  async (req, res) => {
    if (!postController) {
      return res.status(500).json({
        success: false,
        message: "Post controller not initialized",
      });
    }
    await postController.createPost(req, res);
  }
);

// Public route - get posts (no auth needed)
router.get("/", async (req, res) => {
  if (!postController) {
    return res.status(500).json({
      success: false,
      message: "Post controller not initialized",
    });
  }
  await postController.getPosts(req, res);
});

// Public route - get single post (no auth needed)
router.get("/:id", async (req, res) => {
  if (!postController) {
    return res.status(500).json({
      success: false,
      message: "Post controller not initialized",
    });
  }
  await postController.getPostById(req, res);
});

// Protected route - update post (needs auth)
router.put(
  "/:id",
  (req, res, next) => {
    if (authMiddleware) {
      authMiddleware(req, res, next);
    } else {
      next();
    }
  },
  async (req, res) => {
    if (!postController) {
      return res.status(500).json({
        success: false,
        message: "Post controller not initialized",
      });
    }
    await postController.updatePost(req, res);
  }
);

// Protected route - delete post (needs auth)
router.delete(
  "/:id",
  (req, res, next) => {
    if (authMiddleware) {
      authMiddleware(req, res, next);
    } else {
      next();
    }
  },
  async (req, res) => {
    if (!postController) {
      return res.status(500).json({
        success: false,
        message: "Post controller not initialized",
      });
    }
    await postController.deletePost(req, res);
  }
);

// Protected route - like/dislike post (needs auth)
router.post(
  "/:id/like",
  (req, res, next) => {
    if (authMiddleware) {
      authMiddleware(req, res, next);
    } else {
      next();
    }
  },
  async (req, res) => {
    if (!postController) {
      return res.status(500).json({
        success: false,
        message: "Post controller not initialized",
      });
    }
    await postController.likePost(req, res);
  }
);

// Protected route - add comment to post (needs auth)
router.post(
  "/:id/comments",
  (req, res, next) => {
    if (authMiddleware) {
      authMiddleware(req, res, next);
    } else {
      next();
    }
  },
  async (req, res) => {
    if (!postController) {
      return res.status(500).json({
        success: false,
        message: "Post controller not initialized",
      });
    }
    await postController.createComment(req, res);
  }
);

module.exports = { router, initializeRoutes };
