const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Infrastructure
const databaseConnection = require("./src/infrastructure/database/connection");
const UserRepository = require("./src/infrastructure/database/repositories/UserRepository");
const PostRepository = require("./src/infrastructure/database/repositories/PostRepository");
const MeetingRepository = require("./src/infrastructure/database/repositories/MeetingRepository");

// Application
const CreatePostUseCase = require("./src/application/usecases/posts/CreatePostUseCase");
const GetPostsUseCase = require("./src/application/usecases/posts/GetPostsUseCase");
const DeletePostUseCase = require("./src/application/usecases/posts/DeletePostUseCase");
const UpdatePostUseCase = require("./src/application/usecases/posts/UpdatePostUseCase");
const LikePostUseCase = require("./src/application/usecases/posts/LikePostUseCase");
const CreateCommentUseCase = require("./src/application/usecases/comments/CreateCommentUseCase");
const LoginEmployeeUseCase = require("./src/application/use-cases/auth/LoginEmployeeUseCase");
const ResetAllPasswordsUseCase = require("./src/application/use-cases/auth/ResetAllPasswordsUseCase");
const ResetEmployeePasswordUseCase = require("./src/application/use-cases/auth/ResetEmployeePasswordUseCase");

// Meeting Use Cases
const GetMeetingsUseCase = require("./src/application/use-cases/meetings/GetMeetingsUseCase");
const GetMeetingDetailsUseCase = require("./src/application/use-cases/meetings/GetMeetingDetailsUseCase");
const CreateMeetingUseCase = require("./src/application/use-cases/meetings/CreateMeetingUseCase");
const UpdateMeetingUseCase = require("./src/application/use-cases/meetings/UpdateMeetingUseCase");
const DeleteMeetingUseCase = require("./src/application/use-cases/meetings/DeleteMeetingUseCase");
const UpdateParticipantNotesUseCase = require("./src/application/use-cases/meetings/UpdateParticipantNotesUseCase");

// Infrastructure Services
const EmailService = require("./src/infrastructure/services/EmailService");

// Presentation
const PostController = require("./src/presentation/controllers/PostController");
const AuthController = require("./src/presentation/controllers/AuthController");
const MeetingController = require("./src/presentation/controllers/MeetingController");
const {
  router: postRoutes,
  initializeRoutes: initializePostRoutes,
} = require("./src/presentation/routes/postRoutes");
const {
  router: authRoutes,
  initializeAuthRoutes,
} = require("./src/presentation/routes/authRoutes");
const {
  router: meetingRoutes,
  initializeMeetingRoutes,
} = require("./src/presentation/routes/meetingRoutes");
const createCommentRoutes = require("./src/presentation/routes/commentRoutes");
const uploadRoutes = require("./src/presentation/routes/uploadRoutes");
const userRoutes = require("./src/presentation/routes/userRoutes");
const requestRoutes = require("./src/presentation/routes/requestRoutes");
const testRoutes = require("./src/presentation/routes/testRoutes");
const {
  authMiddleware,
  requireRole,
} = require("./src/presentation/middleware/authMiddleware");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.initializeDependencies();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false,
      })
    );
    this.app.use(
      cors({
        origin: true, // Allow all origins in development
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
    });
    this.app.use("/api/", limiter);

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Health check
    this.app.get("/health", (req, res) => {
      res.json({ status: "OK", timestamp: new Date().toISOString() });
    });
  }

  async initializeDependencies() {
    try {
      // Initialize database
      await databaseConnection.connect();
      const db = databaseConnection.getPool();

      // Initialize repositories
      const userRepository = new UserRepository(databaseConnection);
      const postRepository = new PostRepository(databaseConnection);
      const meetingRepository = new MeetingRepository(databaseConnection);

      // Initialize use cases
      const createPostUseCase = new CreatePostUseCase(
        postRepository,
        userRepository
      );
      const getPostsUseCase = new GetPostsUseCase(postRepository);
      const deletePostUseCase = new DeletePostUseCase(
        postRepository,
        userRepository
      );
      const updatePostUseCase = new UpdatePostUseCase(
        postRepository,
        userRepository
      );
      const likePostUseCase = new LikePostUseCase(
        postRepository,
        userRepository
      );
      const createCommentUseCase = new CreateCommentUseCase(
        postRepository,
        userRepository
      );
      const loginUseCase = new LoginEmployeeUseCase(userRepository);

      // Initialize services
      const emailService = new EmailService();

      // Initialize additional use cases
      const resetAllPasswordsUseCase = new ResetAllPasswordsUseCase(
        userRepository,
        emailService
      );
      const resetEmployeePasswordUseCase = new ResetEmployeePasswordUseCase(
        userRepository,
        emailService
      );

      // Initialize meeting use cases
      const getMeetingsUseCase = new GetMeetingsUseCase(meetingRepository);
      const getMeetingDetailsUseCase = new GetMeetingDetailsUseCase(
        meetingRepository
      );
      const createMeetingUseCase = new CreateMeetingUseCase(
        meetingRepository,
        null
      ); // notification service later
      const updateMeetingUseCase = new UpdateMeetingUseCase(
        meetingRepository,
        null
      );
      const deleteMeetingUseCase = new DeleteMeetingUseCase(
        meetingRepository,
        null
      );
      const updateParticipantNotesUseCase = new UpdateParticipantNotesUseCase(
        meetingRepository
      );

      // Initialize controllers
      const postController = new PostController(
        createPostUseCase,
        getPostsUseCase,
        deletePostUseCase,
        updatePostUseCase,
        likePostUseCase,
        createCommentUseCase,
        postRepository
      );
      const authController = new AuthController(
        loginUseCase,
        resetAllPasswordsUseCase,
        resetEmployeePasswordUseCase
      );
      const meetingController = new MeetingController(
        getMeetingsUseCase,
        getMeetingDetailsUseCase,
        createMeetingUseCase,
        updateMeetingUseCase,
        deleteMeetingUseCase,
        updateParticipantNotesUseCase
      );

      // Initialize routes
      const authMw = authMiddleware(userRepository);
      const managerRoleMw = requireRole(["Admin", "Manager"]);
      initializePostRoutes(postController, authMw);
      initializeAuthRoutes(authController, authMw, managerRoleMw);
      initializeMeetingRoutes(meetingController);

      this.setupRoutes(userRepository, postRepository);
    } catch (error) {
      console.error("Failed to initialize dependencies:", error);
      process.exit(1);
    }
  }

  setupRoutes(userRepository, postRepository) {
    // Auth middleware setup
    const authMw = authMiddleware(userRepository);
    const adminRole = requireRole(["Admin"]);
    const managerRole = requireRole(["Admin", "Manager"]);

    // API routes
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/posts", postRoutes);
    this.app.use("/api/meetings", authMw, meetingRoutes);
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/requests", requestRoutes);
    this.app.use(
      "/api/messages",
      require("./src/presentation/routes/messageRoutes")
    );
    this.app.use("/api/", createCommentRoutes(postRepository, userRepository));
    this.app.use("/api/upload", authMw, uploadRoutes);
    this.app.use("/api/test", testRoutes);

    // Serve uploaded files statically with CORS headers
    this.app.use(
      "/uploads",
      (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        res.header("Cross-Origin-Resource-Policy", "cross-origin");
        next();
      },
      express.static(path.join(__dirname, "../uploads"))
    );

    // Protected auth routes
    this.app.use("/api/auth/me", authMw);
    this.app.use("/api/auth/reset-all-passwords", authMw);
    this.app.use("/api/auth/reset-employee-password", authMw);

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error("Global error handler:", error);

      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      });
    });
  }

  async start() {
    try {
      this.app.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🌐 API URL: http://localhost:${this.port}/api`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  async stop() {
    try {
      await databaseConnection.close();
      console.log("Server stopped gracefully");
    } catch (error) {
      console.error("Error stopping server:", error);
    }
  }
}

// Initialize and start server
const server = new Server();
server.start();

// Graceful shutdown
process.on("SIGTERM", () => server.stop());
process.on("SIGINT", () => server.stop());

module.exports = server;
