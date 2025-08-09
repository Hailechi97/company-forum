const express = require("express");
const router = express.Router();

// Test endpoint to check database state
router.get("/test/database", async (req, res) => {
  try {
    const databaseConnection = require("../../infrastructure/database/connection");

    // Check Posts table
    const posts = await databaseConnection.query(`
      SELECT PostID, Title, Likes, Dislikes 
      FROM Posts 
      ORDER BY PostID DESC 
      LIMIT 5
    `);

    // Check Likes_Dislikes table
    const likes = await databaseConnection.query(`
      SELECT * 
      FROM Likes_Dislikes 
      ORDER BY LikeDislikeID DESC 
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        posts,
        likes_dislikes: likes,
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      message: "Database test failed",
      error: error.message,
    });
  }
});

module.exports = router;
