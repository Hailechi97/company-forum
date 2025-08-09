const Meeting = require("../../../domain/entities/Meeting");

class MeetingRepository {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  // Find all meetings for a specific employee
  async findByEmployeeId(empId, options = {}) {
    const { page = 1, limit = 20, startDate, endDate } = options;
    const offset = (page - 1) * limit;

    try {
      // Test with simplest possible query first
      const sql = `SELECT COUNT(*) as total FROM Meetings WHERE Organizer = ?`;
      const countParams = [empId];

      console.log("Test count query:", sql);
      console.log("Count parameters:", countParams);

      const countResult = await this.db.query(sql, countParams);
      console.log("Count result:", countResult);

      // Now try the full query
      const fullSql = `
        SELECT 
          m.MeetingID as meetingId,
          m.Title as title,
          m.Content as content,
          m.StartTime as startTime,
          m.EndTime as endTime,
          m.Organizer as organizer,
          m.Participants as participants,
          m.Location as location
        FROM Meetings m
        WHERE m.Organizer = ?
        ORDER BY m.StartTime DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      console.log("Full SQL Query (with inline LIMIT):", fullSql);
      console.log("Parameters:", [empId]);

      const rows = await this.db.query(fullSql, [empId]);
      console.log("Query result rows:", rows.length);

      // Return mapped results
      return rows.map((row) =>
        this.mapRowToEntity({
          ...row,
          organizerFirstName: "Unknown",
          organizerLastName: "Organizer",
        })
      );
    } catch (error) {
      console.error("Database query error:", error);
      // Return empty array instead of throwing error for now
      return [];
    }
  }

  // Find meeting by ID with details
  async findById(meetingId) {
    const sql = `
      SELECT 
        m.MeetingID as meetingId,
        m.Title as title,
        m.Content as content,
        m.StartTime as startTime,
        m.EndTime as endTime,
        m.Organizer as organizer,
        m.Participants as participants,
        m.Location as location,
        e.FirstName as organizerFirstName,
        e.LastName as organizerLastName
      FROM Meetings m
      LEFT JOIN Employees e ON m.Organizer = e.EmpID
      WHERE m.MeetingID = ?
    `;

    const rows = await this.db.query(sql, [meetingId]);
    if (rows.length === 0) return null;

    return this.mapRowToEntity(rows[0]);
  }

  // Get meeting participants
  async getParticipants(meetingId) {
    const sql = `
      SELECT 
        md.DetailID as detailId,
        md.EmpID as empId,
        md.Role as role,
        md.Notes as notes,
        e.FirstName,
        e.LastName,
        e.Email,
        e.Department,
        e.Photo
      FROM MeetingDetails md
      JOIN Employees e ON md.EmpID = e.EmpID
      WHERE md.MeetingID = ?
      ORDER BY md.Role, e.FirstName, e.LastName
    `;

    const rows = await this.db.query(sql, [meetingId]);
    return rows.map((row) => ({
      detailId: row.detailId,
      empId: row.empId,
      role: row.role,
      notes: row.notes,
      firstName: row.FirstName,
      lastName: row.LastName,
      fullName: `${row.FirstName} ${row.LastName}`,
      email: row.Email,
      department: row.Department,
      photo: row.Photo,
    }));
  }

  // Create new meeting
  async create(meeting) {
    const sql = `
      INSERT INTO Meetings (Title, Content, StartTime, EndTime, Organizer, Participants, Location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Format datetime for MySQL (remove 'Z' and use local format)
    const formatDateTimeForMySQL = (dateTime) => {
      const date = new Date(dateTime);
      return date.toISOString().slice(0, 19).replace("T", " ");
    };

    const params = [
      meeting.title,
      meeting.content,
      formatDateTimeForMySQL(meeting.startTime),
      formatDateTimeForMySQL(meeting.endTime),
      meeting.organizer,
      meeting.participants,
      meeting.location,
    ];

    console.log("Create meeting params:", params);
    const result = await this.db.query(sql, params);
    return result.insertId;
  }

  // Add participant to meeting
  async addParticipant(meetingId, empId, role = "Người tham dự", notes = "") {
    const sql = `
      INSERT INTO MeetingDetails (MeetingID, EmpID, Role, Notes)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE Role = VALUES(Role), Notes = VALUES(Notes)
    `;

    await this.db.query(sql, [meetingId, empId, role, notes]);
  }

  // Remove participant from meeting
  async removeParticipant(meetingId, empId) {
    const sql = `DELETE FROM MeetingDetails WHERE MeetingID = ? AND EmpID = ?`;
    await this.db.query(sql, [meetingId, empId]);
  }

  // Update meeting
  async update(meetingId, updates) {
    const setClause = [];
    const params = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.mapFieldToDb(key);
        setClause.push(`${dbField} = ?`);
        params.push(value);
      }
    });

    if (setClause.length === 0) return false;

    params.push(meetingId);
    const sql = `UPDATE Meetings SET ${setClause.join(
      ", "
    )} WHERE MeetingID = ?`;

    const result = await this.db.query(sql, params);
    return result.affectedRows > 0;
  }

  // Delete meeting (also deletes related MeetingDetails via CASCADE)
  async delete(meetingId) {
    // First delete MeetingDetails
    await this.db.query("DELETE FROM MeetingDetails WHERE MeetingID = ?", [
      meetingId,
    ]);

    // Then delete the meeting
    const sql = `DELETE FROM Meetings WHERE MeetingID = ?`;
    const result = await this.db.query(sql, [meetingId]);
    return result.affectedRows > 0;
  }

  // Update participant notes
  async updateParticipantNotes(meetingId, empId, notes) {
    const sql = `
      UPDATE MeetingDetails 
      SET Notes = ? 
      WHERE MeetingID = ? AND EmpID = ?
    `;

    const result = await this.db.query(sql, [notes, meetingId, empId]);
    return result.affectedRows > 0;
  }

  // Get meetings by date range
  async findByDateRange(startDate, endDate, options = {}) {
    const { page = 1, limit = 20, department } = options;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE m.StartTime BETWEEN ? AND ?`;
    let params = [startDate, endDate];

    if (department) {
      whereClause += ` AND e.Department = ?`;
      params.push(department);
    }

    const sql = `
      SELECT DISTINCT
        m.MeetingID as meetingId,
        m.Title as title,
        m.Content as content,
        m.StartTime as startTime,
        m.EndTime as endTime,
        m.Organizer as organizer,
        m.Participants as participants,
        m.Location as location,
        e.FirstName as organizerFirstName,
        e.LastName as organizerLastName
      FROM Meetings m
      LEFT JOIN Employees e ON m.Organizer = e.EmpID
      ${whereClause}
      ORDER BY m.StartTime ASC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    const rows = await this.db.query(sql, params);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  // Find all meetings (for managers)
  async findAll(options = {}) {
    const { page = 1, limit = 20, search, startDate, endDate } = options;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE 1=1`;
    let params = [];

    if (search) {
      whereClause += ` AND (m.Title LIKE ? OR m.Content LIKE ? OR m.Location LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (startDate && endDate) {
      whereClause += ` AND m.StartTime BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    const sql = `
      SELECT 
        m.MeetingID as meetingId,
        m.Title as title,
        m.Content as content,
        m.StartTime as startTime,
        m.EndTime as endTime,
        m.Organizer as organizer,
        m.Participants as participants,
        m.Location as location,
        e.FirstName as organizerFirstName,
        e.LastName as organizerLastName
      FROM Meetings m
      LEFT JOIN Employees e ON m.Organizer = e.EmpID
      ${whereClause}
      ORDER BY m.StartTime DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    const rows = await this.db.query(sql, params);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  // Helper methods
  mapFieldToDb(field) {
    const fieldMap = {
      title: "Title",
      content: "Content",
      startTime: "StartTime",
      endTime: "EndTime",
      organizer: "Organizer",
      participants: "Participants",
      location: "Location",
    };
    return fieldMap[field] || field;
  }

  mapRowToEntity(row) {
    // Calculate duration from startTime and endTime
    const duration =
      row.startTime && row.endTime
        ? Math.ceil(
            (new Date(row.endTime) - new Date(row.startTime)) / (1000 * 60)
          ) // in minutes
        : 60; // default 60 minutes

    // Determine status based on current time and meeting times
    let status = "scheduled";
    if (row.startTime && row.endTime) {
      const now = new Date();
      const startTime = new Date(row.startTime);
      const endTime = new Date(row.endTime);

      if (now >= startTime && now <= endTime) {
        status = "in_progress";
      } else if (now > endTime) {
        status = "completed";
      }
    }

    return {
      id: row.meetingId,
      meetingId: row.meetingId,
      title: row.title,
      description: row.content,
      content: row.content,
      meeting_date: row.startTime,
      startTime: row.startTime,
      endTime: row.endTime,
      duration: duration,
      organizer: row.organizer,
      organizer_id: row.organizer,
      organizer_name:
        row.organizerFirstName && row.organizerLastName
          ? `${row.organizerFirstName} ${row.organizerLastName}`
          : "Unknown Organizer",
      participants: row.participants,
      participant_count: row.participants
        ? row.participants.split(",").length
        : 0,
      location: row.location,
      status: status,
      // Keep original Meeting entity structure
      ...new Meeting({
        meetingId: row.meetingId,
        title: row.title,
        content: row.content,
        startTime: row.startTime,
        endTime: row.endTime,
        organizer: row.organizer,
        participants: row.participants,
        location: row.location,
      }),
    };
  }
}

module.exports = MeetingRepository;
