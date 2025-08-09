// Use Case: Search Users
class SearchUsersUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(userId, query, options = {}) {
    try {
      const { limit = 10 } = options;

      if (!query || query.trim().length < 2) {
        return {
          success: true,
          data: [],
        };
      }

      console.log("SearchUsersUseCase - userId:", userId, "query:", query);

      // Search users
      const users = await this.messageRepository.searchUsers(
        query.trim(),
        userId,
        limit
      );

      console.log("SearchUsersUseCase - found users:", users.length);

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      console.error("SearchUsersUseCase error:", error);
      throw new Error(`Không thể tìm kiếm người dùng: ${error.message}`);
    }
  }
}

module.exports = SearchUsersUseCase;
