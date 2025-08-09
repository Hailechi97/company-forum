class PostController {
  constructor(
    createPostUseCase,
    getPostsUseCase,
    deletePostUseCase,
    updatePostUseCase,
    likePostUseCase,
    createCommentUseCase,
    postRepository
  ) {
    this.createPostUseCase = createPostUseCase;
    this.getPostsUseCase = getPostsUseCase;
    this.deletePostUseCase = deletePostUseCase;
    this.updatePostUseCase = updatePostUseCase;
    this.likePostUseCase = likePostUseCase;
    this.createCommentUseCase = createCommentUseCase;
    this.postRepository = postRepository;
  }

  async createPost(req, res) {
    try {
      const postData = {
        title: req.body.title,
        content: req.body.content,
        imageURL: req.body.imageURL,
      };

      const authorId = req.user.empId; // From auth middleware

      const result = await this.createPostUseCase.execute(postData, authorId);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      console.error("Create post controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getPosts(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        authorId: req.query.authorId ? parseInt(req.query.authorId) : undefined,
        search: req.query.search || "",
        sortBy: req.query.sortBy || "postedDate",
        sortOrder: req.query.sortOrder || "DESC",
      };

      const result = await this.getPostsUseCase.execute(options);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      console.error("Get posts controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getPostById(req, res) {
    try {
      const postId = req.params.id;
      const viewerId = req.user?.empId;

      const result = await this.getPostsUseCase.executeGetById(
        postId,
        viewerId
      );

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getFeaturedPosts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const result = await this.getPostsUseCase.getFeaturedPosts(limit);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getPopularPosts(req, res) {
    try {
      const timeframe = req.query.timeframe || "week";
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.getPostsUseCase.getPopularPosts(
        timeframe,
        limit
      );

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async updatePost(req, res) {
    try {
      const postId = req.params.id;
      const updateData = req.body;
      const userId = req.user.id;

      const result = await this.updatePostUseCase.execute(
        postId,
        updateData,
        userId
      );

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async deletePost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;

      const result = await this.deletePostUseCase.execute(postId, userId);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async likePost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.empId;
      const isLike = req.body.isLike !== false; // Default to true (like)

      const result = await this.likePostUseCase.execute(postId, userId, isLike);

      res.json({
        success: true,
        message: result.message,
        data: { action: result.action },
      });
    } catch (error) {
      console.error("Like post controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deletePost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.empId;

      const result = await this.deletePostUseCase.execute(postId, userId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Delete post controller error:", error);
      res.status(error.message.includes("không có quyền") ? 403 : 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async updatePost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.empId;
      const updateData = {
        title: req.body.title,
        content: req.body.content,
        imageURL: req.body.imageURL,
        status: req.body.status,
      };

      const result = await this.updatePostUseCase.execute(
        postId,
        updateData,
        userId
      );

      res.json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Update post controller error:", error);
      res
        .status(error.message.includes("chỉ có thể chỉnh sửa") ? 403 : 500)
        .json({
          success: false,
          message: error.message || "Internal server error",
        });
    }
  }

  async createComment(req, res) {
    try {
      console.log("CreateComment - Request body:", req.body);
      console.log("CreateComment - Request params:", req.params);
      console.log("CreateComment - Request user:", req.user);

      const commentData = {
        postId: req.params.id,
        content: req.body.content,
        imageURL: req.body.imageURL,
        parentCommentId: req.body.parentCommentId,
      };

      const userId = req.user.empId;

      console.log("CreateComment - Comment data:", commentData);
      console.log("CreateComment - User ID:", userId);

      const result = await this.createCommentUseCase.execute(
        commentData,
        userId
      );

      console.log("CreateComment - Success result:", result);

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Create comment controller error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getPostById(req, res) {
    try {
      const postId = req.params.id;

      // Increment view count
      await this.postRepository.incrementViews(postId);

      const post = await this.postRepository.findById(postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Bài viết không tồn tại",
        });
      }

      const comments = await this.postRepository.getCommentsForPost(postId);

      res.json({
        success: true,
        data: {
          post,
          comments,
        },
      });
    } catch (error) {
      console.error("Get post by ID controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = PostController;
