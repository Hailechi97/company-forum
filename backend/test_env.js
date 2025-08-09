require("dotenv").config();

console.log("📋 Environment variables:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "LOADED" : "NOT LOADED");
console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
