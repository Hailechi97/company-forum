# Company Forum - Clean Architecture

🔗 **GitHub Repository**: https://github.com/Hailechi97/company-forum.git

## 🏗️ Architecture Overview

This project implements **Clean Architecture** principles for a company forum system that can be used for both web and mobile development.

### 📁 Project Structure

```
company-forum/
├── 📁 backend/                           # API Backend (Node.js/Express)
│   ├── 📁 src/
│   │   ├── 📁 domain/                    # Core Business Logic
│   │   │   ├── 📁 entities/              # Business entities
│   │   │   ├── 📁 repositories/          # Interface contracts
│   │   │   ├── 📁 services/              # Domain services
│   │   │   └── 📁 events/                # Domain events
│   │   │
│   │   ├── 📁 application/               # Use Cases & Business Logic
│   │   │   ├── 📁 usecases/              # Application use cases
│   │   │   ├── 📁 dtos/                  # Data Transfer Objects
│   │   │   ├── 📁 interfaces/            # Application interfaces
│   │   │   └── 📁 validators/            # Input validation
│   │   │
│   │   ├── 📁 infrastructure/            # External Concerns
│   │   │   ├── 📁 database/              # Database implementations
│   │   │   ├── 📁 services/              # External services
│   │   │   └── 📁 auth/                  # Authentication
│   │   │
│   │   ├── 📁 presentation/              # API Layer
│   │   │   ├── 📁 controllers/           # HTTP controllers
│   │   │   ├── 📁 routes/                # Route definitions
│   │   │   ├── 📁 middleware/            # Express middleware
│   │   │   └── 📁 serializers/           # Response formatting
│   │   │
│   │   └── 📁 shared/                    # Cross-cutting concerns
│   │       ├── 📁 constants/
│   │       ├── 📁 utils/
│   │       ├── 📁 errors/
│   │       └── 📁 types/
│   │
│   └── server.js                         # Application entry point
│
├── 📁 web-frontend/                      # Web Application
│   ├── 📁 src/
│   │   ├── 📁 components/                # Reusable UI components
│   │   ├── 📁 pages/                     # Page components
│   │   ├── 📁 services/                  # API calls
│   │   ├── 📁 hooks/                     # Custom React hooks
│   │   ├── 📁 store/                     # State management (Zustand)
│   │   └── 📁 utils/                     # Frontend utilities
│   │
│   └── package.json
│
├── 📁 shared/                            # Shared utilities across platforms
│   ├── 📁 constants/                     # Shared constants
│   ├── 📁 types/                         # TypeScript definitions
│   └── 📁 api-client/                    # API client library
│
└── 📁 docs/                              # Documentation
```

## 🎯 Clean Architecture Benefits

### For Web & Mobile Development:

1. **Business Logic Reuse**: Domain and Application layers can be shared
2. **Platform Independence**: Core logic doesn't depend on UI framework
3. **Easy Testing**: Clear separation makes unit testing straightforward
4. **Maintainability**: Changes in one layer don't affect others
5. **Scalability**: Easy to add new features or platforms

## 🚀 Getting Started

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Setup database:**
   - Create MySQL database
   - Run migration: `backend/src/infrastructure/database/migrations/001_initial_schema.sql`

3. **Environment configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd web-frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

## 🔧 Technology Stack

### Backend:
- **Framework**: Express.js
- **Database**: MySQL with mysql2
- **Authentication**: JWT
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer
- **Email**: Nodemailer

### Frontend:
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Query Management**: TanStack Query
- **Forms**: React Hook Form
- **UI Components**: Headless UI

## 📱 Mobile Development Ready

This architecture is designed to support mobile development:

1. **React Native**: Can reuse API services and business logic
2. **Flutter**: Can consume the same REST API
3. **Shared API Client**: Common API interface across platforms

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (User, Moderator, Admin)
- Protected routes and middleware
- Secure password hashing with bcrypt

## 📊 Features

### Core Features:
- User registration and authentication
- Post creation, editing, and deletion
- Comments and replies (nested)
- Categories and tags
- Like/unlike posts and comments
- Real-time notifications
- File uploads (images, documents)
- Search functionality
- User profiles and avatars

### Moderation Features:
- Pin/unpin posts
- Lock/unlock discussions
- Hide/show content
- User management
- Content moderation

## 🧪 Testing Strategy

- **Unit Tests**: Domain entities and use cases
- **Integration Tests**: Repository implementations
- **E2E Tests**: API endpoints
- **Frontend Tests**: Component testing

## 📈 Future Mobile Integration

When ready for mobile development:

1. **React Native**:
   ```
   mobile-app/react-native/
   ├── src/
   │   ├── components/
   │   ├── screens/
   │   ├── services/      # Reuse API client
   │   ├── navigation/
   │   └── store/         # Reuse state logic
   ```

2. **Flutter**:
   ```
   mobile-app/flutter/
   ├── lib/
   │   ├── features/
   │   ├── core/
   │   └── shared/        # Reuse business logic
   ```

## 🛠️ Development Guidelines

1. **Domain Layer**: Pure business logic, no external dependencies
2. **Application Layer**: Orchestrates domain objects and external services
3. **Infrastructure Layer**: Implements external concerns (database, email, etc.)
4. **Presentation Layer**: Handles HTTP requests and responses

## 📝 API Documentation

The API follows RESTful conventions:

- `GET /api/posts` - Get posts with pagination
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

Authentication required for most endpoints via `Authorization: Bearer <token>` header.

## 🤝 Contributing

1. Follow Clean Architecture principles
2. Write tests for new features
3. Update documentation
4. Follow coding standards

This structure provides a solid foundation for both immediate web development and future mobile expansion while maintaining clean, testable, and maintainable code.
