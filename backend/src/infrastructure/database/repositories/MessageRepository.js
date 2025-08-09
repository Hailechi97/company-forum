const Message = require("../../../domain/entities/Message");

class MessageRepository {
  constructor(db) {
    this.db = db;
  }

  // Map database row to Message entity
  mapRowToEntity(row) {
    return new Message({
      messageId: row.messageId,
      senderId: row.senderId,
      receiverId: row.receiverId,
      content: row.content,
      messageType: row.messageType,
      attachedFile: row.attachedFile,
      sentAt: row.sentAt,
      isRead: row.isRead,
      isDeleted: row.isDeleted,
      senderName: row.senderName,
      senderPhoto: row.senderPhoto,
      receiverName: row.receiverName,
      receiverPhoto: row.receiverPhoto,
    });
  }

  // Send message
  async create(message) {
    try {
      const sql = `
        INSERT INTO Messages (SenderID, ReceiverID, Content, MessageType, AttachedFile)
        VALUES (?, ?, ?, ?, ?)
      `;

      const params = [
        message.senderId,
        message.receiverId,
        message.content,
        message.messageType,
        message.attachedFile,
      ];

      const result = await this.db.query(sql, params);
      return result.insertId;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Get conversation between two users
  async getConversation(userId1, userId2, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT 
          m.MessageID as messageId,
          m.SenderID as senderId,
          m.ReceiverID as receiverId,
          m.Content as content,
          m.MessageType as messageType,
          m.AttachedFile as attachedFile,
          m.SentAt as sentAt,
          m.IsRead as isRead,
          m.IsDeleted as isDeleted,
          CONCAT(s.FirstName, ' ', s.LastName) as senderName,
          s.Photo as senderPhoto,
          CONCAT(r.FirstName, ' ', r.LastName) as receiverName,
          r.Photo as receiverPhoto
        FROM Messages m
        JOIN Employees s ON m.SenderID = s.EmpID
        JOIN Employees r ON m.ReceiverID = r.EmpID
        WHERE ((m.SenderID = ? AND m.ReceiverID = ?) OR (m.SenderID = ? AND m.ReceiverID = ?))
          AND m.IsDeleted = FALSE
        ORDER BY m.SentAt DESC
        LIMIT ? OFFSET ?
      `;

      const limitValue = parseInt(limit) || 50; // Default to 50 if limit is NaN
      const offsetValue = parseInt(offset) || 0; // Default to 0 if offset is NaN
      const params = [
        userId1,
        userId2,
        userId2,
        userId1,
        limitValue,
        offsetValue,
      ];
      const rows = await this.db.query(sql, params);

      return rows.map((row) => this.mapRowToEntity(row));
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Get recent conversations for a user
  async getRecentConversations(userId, limit = 20) {
    try {
      const sql = `
        SELECT DISTINCT
          CASE 
            WHEN m.SenderID = ? THEN m.ReceiverID 
            ELSE m.SenderID 
          END as contactId,
          CONCAT(e.FirstName, ' ', e.LastName) as contactName,
          e.Photo as contactPhoto,
          e.Department as contactDepartment,
          e.ChucVu as contactPosition,
          m.Content as lastMessage,
          m.SentAt as lastMessageTime,
          (m.SenderID = ?) as isSentByMe,
          (SELECT COUNT(*) 
           FROM Messages m2 
           WHERE m2.ReceiverID = ? 
             AND m2.SenderID = (CASE WHEN m.SenderID = ? THEN m.ReceiverID ELSE m.SenderID END)
             AND m2.IsRead = FALSE 
             AND m2.IsDeleted = FALSE
          ) as unreadCount
        FROM Messages m
        JOIN Employees e ON (
          CASE 
            WHEN m.SenderID = ? THEN m.ReceiverID = e.EmpID
            ELSE m.SenderID = e.EmpID
          END
        )
        WHERE (m.SenderID = ? OR m.ReceiverID = ?) 
          AND m.IsDeleted = FALSE
          AND e.Status = 'Hoạt động'
          AND m.MessageID IN (
            SELECT MAX(m2.MessageID)
            FROM Messages m2 
            WHERE ((m2.SenderID = ? AND m2.ReceiverID = m.ReceiverID) 
               OR (m2.SenderID = m.ReceiverID AND m2.ReceiverID = ?))
              AND m2.IsDeleted = FALSE
            GROUP BY LEAST(m2.SenderID, m2.ReceiverID), GREATEST(m2.SenderID, m2.ReceiverID)
          )
        ORDER BY m.SentAt DESC
        LIMIT ?
      `;

      const limitValue = parseInt(limit) || 20; // Default to 20 if limit is NaN
      const params = [
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        limitValue,
      ];
      const rows = await this.db.query(sql, params);

      return rows.map((row) => ({
        contactId: row.contactId,
        contactName: row.contactName,
        contactPhoto: row.contactPhoto,
        contactDepartment: row.contactDepartment,
        contactPosition: row.contactPosition,
        lastMessage: row.lastMessage,
        lastMessageTime: row.lastMessageTime,
        isSentByMe: Boolean(row.isSentByMe),
        unreadCount: row.unreadCount,
      }));
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(userId, senderId) {
    try {
      const sql = `
        UPDATE Messages 
        SET IsRead = TRUE 
        WHERE ReceiverID = ? AND SenderID = ? AND IsRead = FALSE
      `;

      const result = await this.db.query(sql, [userId, senderId]);
      return result.affectedRows;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Search users for chat
  async searchUsers(query, currentUserId, limit = 10) {
    try {
      console.log("🔍 Search params:", { query, currentUserId, limit });

      const sql = `
        SELECT 
          e.EmpID as empId,
          CONCAT(e.FirstName, ' ', e.LastName) as fullName,
          e.Email as email,
          e.Photo as photo,
          e.Department as department,
          e.ChucVu as position
        FROM Employees e
        WHERE e.EmpID != ? 
          AND e.Status = 'Hoạt động'
          AND (
            CONCAT(e.FirstName, ' ', e.LastName) LIKE ? 
            OR e.Email LIKE ?
            OR e.EmpID LIKE ?
          )
        ORDER BY CONCAT(e.FirstName, ' ', e.LastName)
        LIMIT ?
      `;

      const searchPattern = `%${query}%`;
      const limitValue = parseInt(limit) || 10; // Default to 10 if limit is NaN
      const params = [
        currentUserId,
        searchPattern,
        searchPattern,
        searchPattern,
        limitValue,
      ];
      console.log("📋 SQL params:", params);

      const rows = await this.db.query(sql, params);
      console.log("📊 Search results:", rows);

      return rows.map((row) => ({
        empId: row.empId,
        fullName: row.fullName,
        email: row.email,
        photo: row.photo,
        department: row.department,
        position: row.position,
      }));
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId, userId) {
    try {
      const sql = `
        UPDATE Messages 
        SET IsDeleted = TRUE 
        WHERE MessageID = ? AND SenderID = ?
      `;

      const result = await this.db.query(sql, [messageId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Get unread count for user
  async getUnreadCount(userId) {
    try {
      const sql = `
        SELECT COUNT(*) as count
        FROM Messages 
        WHERE ReceiverID = ? AND IsRead = FALSE AND IsDeleted = FALSE
      `;

      const result = await this.db.query(sql, [userId]);
      return result[0]?.count || 0;
    } catch (error) {
      console.error("Database query error:", error);
      return 0;
    }
  }

  // GROUP CHAT METHODS

  // Send group message
  async createGroupMessage(
    groupId,
    senderId,
    content,
    messageType = "text",
    attachedFile = null
  ) {
    try {
      const sql = `
        INSERT INTO GroupMessages (GroupID, SenderID, Content, MessageType, AttachedFile)
        VALUES (?, ?, ?, ?, ?)
      `;

      const params = [
        parseInt(groupId),
        senderId,
        content,
        messageType,
        attachedFile,
      ];
      const result = await this.db.query(sql, params);
      return result.insertId;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Get group messages
  async getGroupMessages(groupId, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT 
          gm.MessageID as messageId,
          gm.GroupID as groupId,
          gm.SenderID as senderId,
          gm.Content as content,
          gm.MessageType as messageType,
          gm.AttachedFile as attachedFile,
          gm.SentAt as sentAt,
          gm.IsDeleted as isDeleted,
          CONCAT(e.FirstName, ' ', e.LastName) as senderName,
          e.Photo as senderPhoto
        FROM GroupMessages gm
        JOIN Employees e ON gm.SenderID = e.EmpID
        WHERE gm.GroupID = ? AND gm.IsDeleted = FALSE
        ORDER BY gm.SentAt DESC
        LIMIT ? OFFSET ?
      `;

      const limitValue = parseInt(limit) || 20; // Default to 20 if limit is NaN
      const offsetValue = parseInt(offset) || 0; // Default to 0 if offset is NaN
      const params = [parseInt(groupId), limitValue, offsetValue];
      const rows = await this.db.query(sql, params);

      return rows.map((row) => ({
        messageId: row.messageId,
        groupId: row.groupId,
        senderId: row.senderId,
        content: row.content,
        messageType: row.messageType,
        attachedFile: row.attachedFile,
        sentAt: row.sentAt,
        isDeleted: Boolean(row.isDeleted),
        senderName: row.senderName,
        senderPhoto: row.senderPhoto,
      }));
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Get user's group chats
  async getUserGroups(userId) {
    try {
      const sql = `
        SELECT 
          g.GroupID as groupId,
          g.GroupName as groupName,
          g.GroupType as groupType,
          g.Department as department,
          g.GroupAvatar as groupAvatar,
          g.Description as description,
          COUNT(DISTINCT gm.EmpID) as memberCount,
          MAX(msg.SentAt) as lastActivity,
          (SELECT Content FROM GroupMessages WHERE GroupID = g.GroupID ORDER BY SentAt DESC LIMIT 1) as lastMessage
        FROM GroupChats g
        JOIN GroupMembers gm ON g.GroupID = gm.GroupID
        LEFT JOIN GroupMessages msg ON g.GroupID = msg.GroupID
        WHERE gm.EmpID = ?
        GROUP BY g.GroupID, g.GroupName, g.GroupType, g.Department, g.GroupAvatar, g.Description
        ORDER BY lastActivity DESC, g.CreatedAt DESC
      `;

      const rows = await this.db.query(sql, [userId]);
      return rows;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Get group members
  async getGroupMembers(groupId) {
    try {
      const sql = `
        SELECT 
          e.EmpID as empId,
          CONCAT(e.FirstName, ' ', e.LastName) as fullName,
          e.Photo as photo,
          e.Department,
          e.ChucVu as position,
          e.Email,
          gm.Role as groupRole,
          gm.JoinedAt as joinedAt
        FROM GroupMembers gm
        JOIN Employees e ON gm.EmpID = e.EmpID
        WHERE gm.GroupID = ?
        ORDER BY gm.Role DESC, e.FirstName
      `;

      const rows = await this.db.query(sql, [groupId]);
      return rows;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }
}

module.exports = MessageRepository;
