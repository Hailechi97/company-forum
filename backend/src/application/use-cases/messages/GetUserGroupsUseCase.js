// Use Case: Get User Groups
class GetUserGroupsUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute(userId) {
    try {
      console.log("GetUserGroupsUseCase - userId:", userId);

      // Get user's groups
      const groups = await this.messageRepository.getUserGroups(userId);

      console.log("GetUserGroupsUseCase - found groups:", groups.length);

      return {
        success: true,
        data: groups,
      };
    } catch (error) {
      console.error("GetUserGroupsUseCase error:", error);
      throw new Error(`Không thể tải danh sách nhóm: ${error.message}`);
    }
  }
}

module.exports = GetUserGroupsUseCase;
