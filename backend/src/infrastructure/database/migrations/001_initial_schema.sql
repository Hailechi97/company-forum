-- Employee Management System Database Schema - Clean Architecture Compatible

DROP DATABASE IF EXISTS EmployeeManagement;
CREATE DATABASE EmployeeManagement;
USE EmployeeManagement;

-- Bảng Nhân viên (Employees)
CREATE TABLE Employees (
    EmpID VARCHAR(20) PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Gender ENUM('Nam', 'Nữ', 'Khác') NOT NULL,
    Birthdate DATE NOT NULL,
    Telephone VARCHAR(15) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Address_loc TEXT,
    Department VARCHAR(100) NOT NULL,
    ChucVu VARCHAR(100) NOT NULL,
    CapBac VARCHAR(50),
    Photo VARCHAR(255),
    ChuKiLuong ENUM('Hàng tháng', 'Hàng quý', 'Hàng năm') NOT NULL,
    LuongCoBan DECIMAL(10,2) NOT NULL,
    NgayThamGia DATETIME NOT NULL,
    Status ENUM('Hoạt động', 'Nghỉ việc', 'Tạm nghỉ') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Người dùng (Users)
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    EmpID VARCHAR(20) UNIQUE NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Salt VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'Manager', 'Employee') DEFAULT 'Employee' NOT NULL,
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Phòng ban (Departments)
CREATE TABLE Departments (
    DeptID INT PRIMARY KEY AUTO_INCREMENT,
    DeptName VARCHAR(100) NOT NULL,
    ManagerID VARCHAR(20),
    FOREIGN KEY (ManagerID) REFERENCES Employees(EmpID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Team (Teams)
CREATE TABLE Teams (
    TeamID INT PRIMARY KEY AUTO_INCREMENT,
    TeamName VARCHAR(100) NOT NULL,
    DeptID INT,
    FOREIGN KEY (DeptID) REFERENCES Departments(DeptID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Bài viết (Posts)
CREATE TABLE Posts (
    PostID INT PRIMARY KEY AUTO_INCREMENT,
    EmpID VARCHAR(20) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    ImageURL VARCHAR(255),
    PostedDate DATETIME NOT NULL,
    Views INT DEFAULT 0,
    Likes INT DEFAULT 0,
    Dislikes INT DEFAULT 0,
    Status ENUM('Công khai', 'Nháp', 'Ẩn') DEFAULT 'Công khai',
    Location VARCHAR(255),
    Tags JSON,
    IsUrgent BOOLEAN DEFAULT FALSE,
    AllowComments BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Bình luận (Comments)
CREATE TABLE Comments (
    CommentID INT PRIMARY KEY AUTO_INCREMENT,
    PostID INT NOT NULL,
    EmpID VARCHAR(20) NOT NULL,
    Content TEXT NOT NULL,
    ImageURL VARCHAR(255),
    CommentDate DATETIME NOT NULL,
    ParentCommentID INT,
    FOREIGN KEY (PostID) REFERENCES Posts(PostID) ON DELETE CASCADE,
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID),
    FOREIGN KEY (ParentCommentID) REFERENCES Comments(CommentID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Likes/Dislikes (Likes_Dislikes)
CREATE TABLE Likes_Dislikes (
    LikeDislikeID INT AUTO_INCREMENT PRIMARY KEY,
    EmpID VARCHAR(20) NOT NULL,
    PostID INT,
    CommentID INT,
    LikeStatus BOOLEAN NOT NULL, -- TRUE: Like, FALSE: Dislike
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID),
    FOREIGN KEY (PostID) REFERENCES Posts(PostID) ON DELETE CASCADE,
    FOREIGN KEY (CommentID) REFERENCES Comments(CommentID) ON DELETE CASCADE,
    CONSTRAINT check_post_or_comment CHECK (
        (PostID IS NOT NULL AND CommentID IS NULL) OR 
        (PostID IS NULL AND CommentID IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Đơn từ (Requests)
CREATE TABLE Requests (
    RequestID INT PRIMARY KEY AUTO_INCREMENT,
    EmpID VARCHAR(20) NOT NULL,
    RequestType ENUM('Nghỉ phép', 'Công tác', 'Hỗ trợ', 'Tăng lương') NOT NULL,
    Content TEXT NOT NULL,
    RequestDate DATETIME NOT NULL,
    Status ENUM('Chờ duyệt', 'Đã duyệt', 'Từ chối') DEFAULT 'Chờ duyệt',
    ApprovedBy VARCHAR(20),
    ApprovedDate DATETIME,
    ApproverRole ENUM('Manager', 'Admin') NOT NULL,
    AttachedFile VARCHAR(255) NULL,
    RejectionReason TEXT,
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID),
    FOREIGN KEY (ApprovedBy) REFERENCES Employees(EmpID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Lịch họp (Meetings)
CREATE TABLE Meetings (
    MeetingID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    Organizer VARCHAR(20) NOT NULL,
    Participants TEXT,
    Location VARCHAR(255) NOT NULL,
    FOREIGN KEY (Organizer) REFERENCES Employees(EmpID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Chi tiết Lịch họp (MeetingDetails)
CREATE TABLE MeetingDetails (
    DetailID INT PRIMARY KEY AUTO_INCREMENT,
    MeetingID INT NOT NULL,
    EmpID VARCHAR(20) NOT NULL,
    Role ENUM('Người tổ chức', 'Người tham dự', 'Khách mời') NOT NULL,
    Notes TEXT,
    FOREIGN KEY (MeetingID) REFERENCES Meetings(MeetingID),
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Lịch (Schedules)
CREATE TABLE Schedules (
    ScheduleID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Day INT NOT NULL, -- 1: Chủ nhật, 2: Thứ 2, ..., 7: Thứ 7
    Content TEXT NOT NULL,
    Room VARCHAR(200) NOT NULL,
    MeetingTime DATETIME NOT NULL,
    Department VARCHAR(100) NOT NULL,
    CreatedBy VARCHAR(20) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CreatedBy) REFERENCES Employees(EmpID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng Thông báo (Notifications)
CREATE TABLE Notifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    EmpID VARCHAR(20) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    NotificationDate DATETIME NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    Type VARCHAR(50) NOT NULL,
    DetailsLink VARCHAR(255),
    Priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    PushSent BOOLEAN DEFAULT FALSE,
    DeepLink VARCHAR(255),
    ImageURL VARCHAR(255),
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mobile Support Tables

-- Device Tokens for Push Notifications
CREATE TABLE DeviceTokens (
    TokenID INT AUTO_INCREMENT PRIMARY KEY,
    EmpID VARCHAR(20) NOT NULL,
    DeviceToken VARCHAR(500) NOT NULL,
    Platform ENUM('iOS', 'Android', 'Web') NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID) ON DELETE CASCADE,
    UNIQUE KEY unique_emp_token (EmpID, DeviceToken)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Sessions for multi-device management
CREATE TABLE UserSessions (
    SessionID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    DeviceInfo TEXT,
    IPAddress VARCHAR(45),
    UserAgent TEXT,
    Platform VARCHAR(50),
    IsActive BOOLEAN DEFAULT TRUE,
    LoginTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastActivity DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ExpiryTime DATETIME,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Offline Sync Queue for mobile
CREATE TABLE SyncQueue (
    SyncID INT AUTO_INCREMENT PRIMARY KEY,
    EmpID VARCHAR(20) NOT NULL,
    EntityType ENUM('Post', 'Comment', 'Like', 'Request', 'Notification') NOT NULL,
    EntityID INT NOT NULL,
    Action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    Data JSON,
    Status ENUM('PENDING', 'SYNCED', 'FAILED') DEFAULT 'PENDING',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    SyncedAt DATETIME NULL,
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- App Settings
CREATE TABLE AppSettings (
    SettingID INT AUTO_INCREMENT PRIMARY KEY,
    EmpID VARCHAR(20) NOT NULL,
    SettingKey VARCHAR(100) NOT NULL,
    SettingValue TEXT,
    Platform VARCHAR(50) DEFAULT 'ALL',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID) ON DELETE CASCADE,
    UNIQUE KEY unique_emp_setting (EmpID, SettingKey, Platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- File Attachments
CREATE TABLE FileAttachments (
    AttachmentID INT AUTO_INCREMENT PRIMARY KEY,
    EmpID VARCHAR(20) NOT NULL,
    EntityType ENUM('Post', 'Comment', 'Request', 'Message') NOT NULL,
    EntityID INT NOT NULL,
    FileName VARCHAR(255) NOT NULL,
    FileSize BIGINT NOT NULL,
    FileType VARCHAR(100) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    ThumbnailPath VARCHAR(500),
    UploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for performance
CREATE INDEX idx_posts_created_at ON Posts(PostedDate DESC);
CREATE INDEX idx_comments_post_id ON Comments(PostID);
CREATE INDEX idx_notifications_emp_id ON Notifications(EmpID, IsRead);
CREATE INDEX idx_device_tokens_emp_id ON DeviceTokens(EmpID, IsActive);
CREATE INDEX idx_user_sessions_user_id ON UserSessions(UserID, IsActive);

-- Insert sample data
INSERT INTO Employees (EmpID, FirstName, LastName, Gender, Birthdate, Telephone, Email, Address_loc, Department, ChucVu, CapBac, Photo, ChuKiLuong, LuongCoBan, NgayThamGia, Status)
VALUES ('E000', 'Admin', 'System', 'Nam', '1980-01-01', '0900000000', 'admin@company.com', 'Hà Nội', 'Hệ thống', 'Quản trị viên', 'A0', NULL, 'Hàng tháng', 30000000, '2018-01-01 00:00:00', 'Hoạt động');

INSERT INTO Users (EmpID, Email, PasswordHash, Salt, Role)
VALUES ('E000', 'admin@company.com', '$2b$10$X1lTjB5fJ5b5fJ5b5fJ5b5u', 'salt_admin', 'Admin');
