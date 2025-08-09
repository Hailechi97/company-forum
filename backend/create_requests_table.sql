-- Create Requests table
CREATE TABLE IF NOT EXISTS Requests (
    RequestID INT AUTO_INCREMENT PRIMARY KEY,
    EmpID VARCHAR(20) NOT NULL,
    RequestType VARCHAR(100) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    AttachedFile JSON,
    RequestDate DATETIME NOT NULL,
    Status ENUM('Chờ duyệt', 'Đã duyệt', 'Từ chối') DEFAULT 'Chờ duyệt',
    ApprovedBy VARCHAR(20),
    ApprovedDate DATETIME,
    ApproverRole VARCHAR(50),
    RejectionReason TEXT,
    FOREIGN KEY (EmpID) REFERENCES Employees(EmpID),
    FOREIGN KEY (ApprovedBy) REFERENCES Employees(EmpID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
