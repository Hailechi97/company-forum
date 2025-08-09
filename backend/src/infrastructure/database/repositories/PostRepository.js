class PostRepository {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  async create(postData) {
    const sql = `
      INSERT INTO Posts (EmpID, Title, Content, ImageURL, PostedDate, Status, AllowComments)
      VALUES (?, ?, ?, ?, NOW(), 'Công khai', ?)
    `;

    const params = [
      postData.authorId,
      postData.title,
      postData.content,
      postData.imageURL || null,
      postData.allowComments !== undefined ? postData.allowComments : true, // Mặc định true
    ];

    const result = await this.db.query(sql, params);
    return this.findById(result.insertId);
  }

  async findById(id) {
    const sql = `
      SELECT 
        p.PostID as id,
        p.Title as title,
        p.Content as content,
        p.ImageURL as imageURL,
        p.PostedDate as postedDate,
        p.Views,
        p.Status,
        p.AllowComments,
        p.EmpID as authorId,
        e.FirstName,
        e.LastName,
        e.Photo as authorPhoto,
        e.Department,
        e.ChucVu as position,
        COALESCE(SUM(CASE WHEN ld.LikeStatus = 1 THEN 1 ELSE 0 END), 0) as likes,
        COALESCE(SUM(CASE WHEN ld.LikeStatus = 0 THEN 1 ELSE 0 END), 0) as dislikes,
        (SELECT COUNT(*) FROM Comments c WHERE c.PostID = p.PostID) as commentCount
      FROM Posts p
      JOIN Employees e ON p.EmpID = e.EmpID
      LEFT JOIN Likes_Dislikes ld ON p.PostID = ld.PostID AND ld.CommentID IS NULL
      WHERE p.PostID = ?
      GROUP BY p.PostID
    `;

    const rows = await this.db.query(sql, [id]);

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0]);
  }

  async findAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      authorId,
      search,
      sortBy = "postedDate",
      sortOrder = "DESC",
    } = options;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Include likes/dislikes counts like in findById
    let sql = `
      SELECT 
        p.PostID as id,
        p.Title as title,
        p.Content as content,
        p.ImageURL as imageURL,
        p.PostedDate as postedDate,
        p.Views,
        p.Status,
        p.AllowComments,
        p.EmpID as authorId,
        e.FirstName,
        e.LastName,
        e.Photo as authorPhoto,
        e.Department,
        e.ChucVu as position,
        COALESCE(SUM(CASE WHEN ld.LikeStatus = 1 THEN 1 ELSE 0 END), 0) as likes,
        COALESCE(SUM(CASE WHEN ld.LikeStatus = 0 THEN 1 ELSE 0 END), 0) as dislikes,
        (SELECT COUNT(*) FROM Comments c WHERE c.PostID = p.PostID) as commentCount
      FROM Posts p
      JOIN Employees e ON p.EmpID = e.EmpID
      LEFT JOIN Likes_Dislikes ld ON p.PostID = ld.PostID AND ld.CommentID IS NULL
      WHERE p.Status = ?
      GROUP BY p.PostID
    `;

    const params = ["Công khai"];

    if (authorId) {
      sql += " AND p.EmpID = ?";
      params.push(authorId);
    }

    if (search) {
      sql += " AND (p.Title LIKE ? OR p.Content LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Sorting
    const validSortColumns = ["postedDate", "title", "views", "likes"];
    const sortColumn = validSortColumns.includes(sortBy)
      ? sortBy
      : "postedDate";
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    if (sortColumn === "postedDate") {
      sql += ` ORDER BY p.PostedDate ${order}`;
    } else if (sortColumn === "title") {
      sql += ` ORDER BY p.Title ${order}`;
    } else if (sortColumn === "views") {
      sql += ` ORDER BY p.Views ${order}`;
    } else if (sortColumn === "likes") {
      sql += ` ORDER BY likes ${order}`;
    }

    sql += ` LIMIT ${limitNum} OFFSET ${offset}`;

    const rows = await this.db.query(sql, params);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async incrementViews(postId) {
    const sql = `UPDATE Posts SET Views = Views + 1 WHERE PostID = ?`;
    return this.db.query(sql, [postId]);
  }

  async update(id, updateData) {
    const allowedFields = ["Title", "Content", "ImageURL", "Status"];
    const updates = [];
    const params = [];

    Object.keys(updateData).forEach((key) => {
      const dbKey = key.charAt(0).toUpperCase() + key.slice(1); // Convert to PascalCase
      if (allowedFields.includes(dbKey)) {
        updates.push(`${dbKey} = ?`);
        params.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      throw new Error("No valid fields to update");
    }

    params.push(id);
    const sql = `UPDATE Posts SET ${updates.join(", ")} WHERE PostID = ?`;

    await this.db.query(sql, params);
    return this.findById(id);
  }

  async delete(id) {
    const sql = `DELETE FROM Posts WHERE PostID = ?`;
    const result = await this.db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  async getCommentsForPost(postId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const sql = `
      SELECT 
        c.CommentID as id,
        c.Content as content,
        c.ImageURL as imageURL,
        c.CommentDate as commentDate,
        c.ParentCommentID as parentCommentId,
        c.EmpID as authorId,
        e.FirstName,
        e.LastName,
        e.Photo as authorPhoto,
        e.Department,
        e.ChucVu as position,
        COALESCE(SUM(CASE WHEN ld.LikeStatus = 1 THEN 1 ELSE 0 END), 0) as likes,
        COALESCE(SUM(CASE WHEN ld.LikeStatus = 0 THEN 1 ELSE 0 END), 0) as dislikes
      FROM Comments c
      JOIN Employees e ON c.EmpID = e.EmpID
      LEFT JOIN Likes_Dislikes ld ON c.CommentID = ld.CommentID AND ld.PostID IS NULL
      WHERE c.PostID = ?
      GROUP BY c.CommentID
      ORDER BY c.CommentDate ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const rows = await this.db.query(sql, [postId]);
    return rows.map((row) => this.mapCommentToEntity(row));
  }

  mapRowToEntity(row) {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      imageURL: row.imageURL,
      postedDate: row.postedDate,
      views: row.Views,
      status: row.Status,
      AllowComments: Boolean(row.AllowComments),
      likes: parseInt(row.likes) || 0,
      dislikes: parseInt(row.dislikes) || 0,
      commentCount: parseInt(row.commentCount) || 0,
      author: {
        id: row.authorId,
        firstName: row.FirstName,
        lastName: row.LastName,
        fullName: `${row.FirstName} ${row.LastName}`,
        photo: row.authorPhoto,
        department: row.Department,
        position: row.position,
      },
    };
  }

  mapCommentToEntity(row) {
    return {
      id: row.id,
      content: row.content,
      imageURL: row.imageURL,
      commentDate: row.commentDate,
      parentCommentId: row.parentCommentId,
      likes: parseInt(row.likes),
      dislikes: parseInt(row.dislikes),
      author: {
        id: row.authorId,
        firstName: row.FirstName,
        lastName: row.LastName,
        fullName: `${row.FirstName} ${row.LastName}`,
        photo: row.authorPhoto,
        department: row.Department,
        position: row.position,
      },
    };
  }

  // Delete post
  async delete(postId) {
    const sql = "DELETE FROM Posts WHERE PostID = ?";
    return await this.db.query(sql, [postId]);
  }

  // Update post
  async update(postId, updateData) {
    const fields = [];
    const values = [];

    if (updateData.title !== undefined) {
      fields.push("Title = ?");
      values.push(updateData.title);
    }

    if (updateData.content !== undefined) {
      fields.push("Content = ?");
      values.push(updateData.content);
    }

    if (updateData.imageURL !== undefined) {
      fields.push("ImageURL = ?");
      values.push(updateData.imageURL);
    }

    if (updateData.status !== undefined) {
      fields.push("Status = ?");
      values.push(updateData.status);
    }

    if (fields.length === 0) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    values.push(postId);
    const sql = `UPDATE Posts SET ${fields.join(", ")} WHERE PostID = ?`;

    await this.db.query(sql, values);
    return this.findById(postId);
  }

  // Increment view count
  async incrementViews(postId) {
    const sql = "UPDATE Posts SET Views = Views + 1 WHERE PostID = ?";
    return await this.db.query(sql, [postId]);
  }

  // Like/Dislike reactions
  async findUserReaction(postId, empId) {
    const sql = `
      SELECT LikeStatus 
      FROM Likes_Dislikes 
      WHERE PostID = ? AND EmpID = ? AND CommentID IS NULL
    `;
    const rows = await this.db.query(sql, [postId, empId]);
    return rows.length > 0 ? rows[0] : null;
  }

  async addReaction(postId, empId, isLike) {
    const sql = `
      INSERT INTO Likes_Dislikes (PostID, EmpID, LikeStatus) 
      VALUES (?, ?, ?)
    `;
    return await this.db.query(sql, [postId, empId, isLike]);
  }

  async updateReaction(postId, empId, isLike) {
    const sql = `
      UPDATE Likes_Dislikes 
      SET LikeStatus = ? 
      WHERE PostID = ? AND EmpID = ? AND CommentID IS NULL
    `;
    return await this.db.query(sql, [isLike, postId, empId]);
  }

  async removeReaction(postId, empId) {
    const sql = `
      DELETE FROM Likes_Dislikes 
      WHERE PostID = ? AND EmpID = ? AND CommentID IS NULL
    `;
    return await this.db.query(sql, [postId, empId]);
  }

  async updateReactionCounts(postId) {
    const sql = `
      UPDATE Posts 
      SET 
        Likes = (SELECT COUNT(*) FROM Likes_Dislikes WHERE PostID = ? AND LikeStatus = 1 AND CommentID IS NULL),
        Dislikes = (SELECT COUNT(*) FROM Likes_Dislikes WHERE PostID = ? AND LikeStatus = 0 AND CommentID IS NULL)
      WHERE PostID = ?
    `;
    return await this.db.query(sql, [postId, postId, postId]);
  }

  // Comments
  async createComment(commentData) {
    const sql = `
      INSERT INTO Comments (PostID, EmpID, Content, ImageURL, CommentDate, ParentCommentID)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      commentData.PostID,
      commentData.EmpID,
      commentData.Content,
      commentData.ImageURL,
      commentData.CommentDate,
      commentData.ParentCommentID,
    ];

    const result = await this.db.query(sql, params);
    return this.findCommentById(result.insertId);
  }

  async findCommentById(commentId) {
    const sql = `
      SELECT 
        c.CommentID as id,
        c.Content as content,
        c.ImageURL as imageURL,
        c.CommentDate as commentDate,
        c.ParentCommentID as parentCommentId,
        c.EmpID as authorId,
        e.FirstName,
        e.LastName,
        e.Photo as authorPhoto,
        e.Department,
        e.ChucVu as position,
        COALESCE(SUM(CASE WHEN ld.LikeStatus = 1 THEN 1 ELSE 0 END), 0) as likes,
        COALESCE(SUM(CASE WHEN ld.LikeStatus = 0 THEN 1 ELSE 0 END), 0) as dislikes
      FROM Comments c
      JOIN Employees e ON c.EmpID = e.EmpID
      LEFT JOIN Likes_Dislikes ld ON c.CommentID = ld.CommentID
      WHERE c.CommentID = ?
      GROUP BY c.CommentID
    `;

    const rows = await this.db.query(sql, [commentId]);
    return rows.length > 0 ? this.mapCommentToEntity(rows[0]) : null;
  }

  async deleteComment(commentId) {
    const sql = "DELETE FROM Comments WHERE CommentID = ?";
    const result = await this.db.query(sql, [commentId]);
    return result.affectedRows > 0;
  }
}

module.exports = PostRepository;
