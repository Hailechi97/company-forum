// Shared types for both frontend and backend
export const UserRoles = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
}

export const PostStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
}

export const PostType = {
  DISCUSSION: 'discussion',
  ANNOUNCEMENT: 'announcement',
  QUESTION: 'question'
}

export const CommentStatus = {
  PUBLISHED: 'published',
  HIDDEN: 'hidden',
  DELETED: 'deleted'
}

export const NotificationType = {
  POST_COMMENT: 'post_comment',
  POST_LIKE: 'post_like',
  COMMENT_REPLY: 'comment_reply',
  COMMENT_LIKE: 'comment_like',
  MENTION: 'mention',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  POST_PINNED: 'post_pinned',
  POST_FEATURED: 'post_featured'
}

export const NotificationPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
}

// API Response Types
export const ApiResponseStatus = {
  SUCCESS: 'success',
  ERROR: 'error'
}

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
}

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
}

// Validation rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_.-]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100
  },
  POST_TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255
  },
  POST_CONTENT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 10000
  },
  COMMENT_CONTENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1000
  },
  CATEGORY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  }
}
