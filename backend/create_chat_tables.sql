-- Chat Tables for Messaging System

USE company_forum;

-- Bảng Messages (Tin nhắn cá nhân)
CREATE TABLE IF NOT EXISTS Messages (
    MessageID INT AUTO_INCREMENT PRIMARY KEY,
    SenderID VARCHAR(20) NOT NULL,
    ReceiverID VARCHAR(20) NOT NULL,
    Content TEXT NOT NULL,
    MessageType ENUM('text', 'image', 'file') DEFAULT 'text',
    AttachedFile VARCHAR(500) NULL,
    SentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsRead BOOLEAN DEFAULT FALSE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (SenderID) REFERENCES Employees(EmpID) ON DELETE CASCADE,
    FOREIGN KEY (ReceiverID) REFERENCES Employees(EmpID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng GroupChats (Nhóm chat)
CREATE TABLE IF NOT EXISTS GroupChats (
    GroupID INT AUTO_INCREMENT PRIMARY KEY,
    GroupName VARCHAR(255) NOT NULL,
    GroupType ENUM('department', 'custom') DEFAULT 'custom',
    Department VARCHAR(100) NULL,
    Description TEXT NULL,
    CreatedBy VARCHAR(20) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (CreatedBy) REFERENCES Employees(EmpID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng GroupMembers (Thành viên nhóm)
CREATE TABLE IF NOT EXISTS GroupMembers (
    GroupMemberID INT AUTO_INCREMENT PRIMARY KEY,
    GroupID INT NOT NULL,
    EmpID VARCHAR(20) NOT NULL,
    Role ENUM('admin', 'member') DEFAULT 'member',
    JoinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (GroupID) REFERENCES GroupChats(GroupID) ON DELETE CASCADE,
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID) ON DELETE CASCADE,
    UNIQUE KEY unique_group_member (GroupID, EmpID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng GroupMessages (Tin nhắn nhóm)
CREATE TABLE IF NOT EXISTS GroupMessages (
    GroupMessageID INT AUTO_INCREMENT PRIMARY KEY,
    GroupID INT NOT NULL,
    SenderID VARCHAR(20) NOT NULL,
    Content TEXT NOT NULL,
    MessageType ENUM('text', 'image', 'file') DEFAULT 'text',
    AttachedFile VARCHAR(500) NULL,
    SentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (GroupID) REFERENCES GroupChats(GroupID) ON DELETE CASCADE,
    FOREIGN KEY (SenderID) REFERENCES Employees(EmpID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for performance
CREATE INDEX idx_messages_sender_id ON Messages(SenderID);
CREATE INDEX idx_messages_receiver_id ON Messages(ReceiverID);
CREATE INDEX idx_messages_sent_at ON Messages(SentAt DESC);
CREATE INDEX idx_group_messages_group_id ON GroupMessages(GroupID);
CREATE INDEX idx_group_messages_sent_at ON GroupMessages(SentAt DESC);
CREATE INDEX idx_group_members_group_id ON GroupMembers(GroupID);
CREATE INDEX idx_group_members_emp_id ON GroupMembers(EmpID);

-- Tạo group chat cho các phòng ban
INSERT IGNORE INTO GroupChats (GroupName, GroupType, Department, Description, CreatedBy)
SELECT 
    CONCAT('Phòng ', Department) as GroupName,
    'department' as GroupType,
    Department,
    CONCAT('Group chat cho phòng ban ', Department) as Description,
    'E000' as CreatedBy
FROM (
    SELECT DISTINCT Department 
    FROM Employees 
    WHERE Department IS NOT NULL AND Department != ''
) as departments;

-- Thêm tất cả nhân viên vào group chat phòng ban tương ứng
INSERT IGNORE INTO GroupMembers (GroupID, EmpID, Role)
SELECT 
    gc.GroupID,
    e.EmpID,
    CASE 
        WHEN e.ChucVu LIKE '%Trưởng%' OR e.ChucVu LIKE '%Giám đốc%' THEN 'admin'
        ELSE 'member'
    END as Role
FROM Employees e
JOIN GroupChats gc ON gc.Department = e.Department
WHERE gc.GroupType = 'department'
AND e.Status = 'Hoạt động';

-- Test data - Thêm một vài tin nhắn mẫu (optional)
-- INSERT INTO Messages (SenderID, ReceiverID, Content, MessageType)
-- VALUES ('E000', 'EMP1748059852751', 'Chào bạn! Đây là tin nhắn test.', 'text');

-- INSERT INTO GroupMessages (GroupID, SenderID, Content, MessageType)
-- VALUES (1, 'E000', 'Chào mọi người! Đây là tin nhắn nhóm test.', 'text');
