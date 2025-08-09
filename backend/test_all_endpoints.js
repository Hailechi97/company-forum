const axios = require("axios");

async function testAllEndpoints() {
  try {
    // Login first
    const loginResponse = await axios.post(
      "http://localhost:3000/api/auth/login",
      {
        email: "minh.le@company.com",
        password: "123456",
      }
    );

    console.log("✅ Login successful");
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Test recent conversations
    console.log("\n📋 Testing recent conversations...");
    try {
      const recentResponse = await axios.get(
        "http://localhost:3000/api/messages/recent",
        { headers }
      );
      console.log(
        "✅ Recent conversations successful:",
        recentResponse.data.data?.length || 0,
        "conversations"
      );
    } catch (error) {
      console.log(
        "❌ Recent conversations failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test user groups
    console.log("\n👥 Testing user groups...");
    try {
      const groupsResponse = await axios.get(
        "http://localhost:3000/api/messages/groups",
        { headers }
      );
      console.log(
        "✅ User groups successful:",
        groupsResponse.data.data?.length || 0,
        "groups"
      );
    } catch (error) {
      console.log(
        "❌ User groups failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test group messages
    console.log("\n💬 Testing group messages...");
    try {
      const groupMessagesResponse = await axios.get(
        "http://localhost:3000/api/messages/group/3",
        { headers }
      );
      console.log(
        "✅ Group messages successful:",
        groupMessagesResponse.data.data?.length || 0,
        "messages"
      );
    } catch (error) {
      console.log(
        "❌ Group messages failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test search users
    console.log("\n🔍 Testing search users...");
    try {
      const searchResponse = await axios.get(
        "http://localhost:3000/api/messages/search?q=nguyen",
        { headers }
      );
      console.log(
        "✅ Search users successful:",
        searchResponse.data.data?.length || 0,
        "users found"
      );
    } catch (error) {
      console.log(
        "❌ Search users failed:",
        error.response?.data?.message || error.message
      );
    }
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
  }
}

testAllEndpoints();
