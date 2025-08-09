const dbConnection = require("./src/infrastructure/database/connection");

async function createMessagesTables() {
  try {
    await dbConnection.connect();

    // Tạo bảng Messages cho chat cá nhân
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS Messages (
        MessageID INT AUTO_INCREMENT PRIMARY KEY,
        SenderID VARCHAR(20) NOT NULL,
        ReceiverID VARCHAR(20) NOT NULL,
        Content TEXT NOT NULL,
        MessageType ENUM('text', 'image', 'file') DEFAULT 'text',
        AttachedFile VARCHAR(255),
        SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        IsRead BOOLEAN DEFAULT FALSE,
        IsDeleted BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (SenderID) REFERENCES Employees(EmpID),
        FOREIGN KEY (ReceiverID) REFERENCES Employees(EmpID),
        INDEX idx_sender_receiver (SenderID, ReceiverID),
        INDEX idx_sent_at (SentAt)
      )
    `);

    // Tạo bảng GroupChats cho chat nhóm
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS GroupChats (
        GroupID INT AUTO_INCREMENT PRIMARY KEY,
        GroupName VARCHAR(100) NOT NULL,
        GroupType ENUM('department', 'custom') DEFAULT 'custom',
        Department VARCHAR(100),
        CreatedBy VARCHAR(20) NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        GroupAvatar VARCHAR(255),
        Description TEXT,
        FOREIGN KEY (CreatedBy) REFERENCES Employees(EmpID)
      )
    `);

    // Tạo bảng GroupMembers cho thành viên nhóm
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS GroupMembers (
        GroupID INT NOT NULL,
        EmpID VARCHAR(20) NOT NULL,
        JoinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        Role ENUM('admin', 'member') DEFAULT 'member',
        PRIMARY KEY (GroupID, EmpID),
        FOREIGN KEY (GroupID) REFERENCES GroupChats(GroupID) ON DELETE CASCADE,
        FOREIGN KEY (EmpID) REFERENCES Employees(EmpID)
      )
    `);

    // Tạo bảng GroupMessages cho tin nhắn nhóm
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS GroupMessages (
        MessageID INT AUTO_INCREMENT PRIMARY KEY,
        GroupID INT NOT NULL,
        SenderID VARCHAR(20) NOT NULL,
        Content TEXT NOT NULL,
        MessageType ENUM('text', 'image', 'file') DEFAULT 'text',
        AttachedFile VARCHAR(255),
        SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        IsDeleted BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (GroupID) REFERENCES GroupChats(GroupID),
        FOREIGN KEY (SenderID) REFERENCES Employees(EmpID),
        INDEX idx_group_sent_at (GroupID, SentAt)
      )
    `);

    // Tự động tạo group chat cho mỗi phòng ban
    await dbConnection.query(`
      INSERT IGNORE INTO GroupChats (GroupName, GroupType, Department, CreatedBy)
      SELECT 
        CONCAT('Chat ', Department) as GroupName,
        'department' as GroupType,
        Department,
        (SELECT EmpID FROM Employees WHERE Department = e.Department AND ChucVu LIKE '%Trưởng%' LIMIT 1) as CreatedBy
      FROM Employees e
      WHERE e.Department IS NOT NULL AND e.Department != ''
      GROUP BY Department
    `);

    // Tự động thêm nhân viên vào group của phòng ban
    await dbConnection.query(`
      INSERT IGNORE INTO GroupMembers (GroupID, EmpID, Role)
      SELECT 
        g.GroupID,
        e.EmpID,
        CASE 
          WHEN e.ChucVu LIKE '%Trưởng%' OR e.ChucVu LIKE '%Manager%' THEN 'admin'
          ELSE 'member'
        END as Role
      FROM GroupChats g
      JOIN Employees e ON g.Department = e.Department
      WHERE g.GroupType = 'department'
    `);

    console.log("✅ Messages tables created successfully!");
    console.log("✅ Department group chats created automatically!");
  } catch (error) {
    console.error("❌ Error creating messages tables:", error.message);
  } finally {
    process.exit(0);
  }
}

createMessagesTables();
