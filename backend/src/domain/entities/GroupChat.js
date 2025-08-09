// Domain Entity: GroupChat
class GroupChat {
  constructor({
    groupId = null,
    groupName,
    groupType = "custom",
    department = null,
    createdBy,
    createdAt = new Date(),
    groupAvatar = null,
    description = null,
    // Additional fields from joins
    memberCount = 0,
    lastMessage = null,
    lastActivity = null,
    unreadCount = 0,
  }) {
    this.groupId = groupId;
    this.groupName = groupName;
    this.groupType = groupType;
    this.department = department;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.groupAvatar = groupAvatar;
    this.description = description;
    this.memberCount = memberCount;
    this.lastMessage = lastMessage;
    this.lastActivity = lastActivity;
    this.unreadCount = unreadCount;
  }

  // Domain methods
  canBeEditedBy(empId, userRole) {
    // Creator or admin can edit
    if (this.createdBy === empId) return true;

    // Department groups can be edited by managers
    if (
      this.groupType === "department" &&
      (userRole === "Manager" || userRole === "Admin")
    ) {
      return true;
    }

    return false;
  }

  canBeDeletedBy(empId, userRole) {
    // Only creator can delete custom groups
    if (this.groupType === "custom") {
      return this.createdBy === empId;
    }

    // Department groups cannot be deleted
    return false;
  }

  canAddMembers(empId, userRole) {
    // Creator or admin can add members
    if (this.createdBy === empId) return true;

    // Department groups: managers can add members from same department
    if (
      this.groupType === "department" &&
      (userRole === "Manager" || userRole === "Admin")
    ) {
      return true;
    }

    return false;
  }

  isDepartmentGroup() {
    return this.groupType === "department";
  }

  isCustomGroup() {
    return this.groupType === "custom";
  }

  getDisplayName() {
    if (this.isDepartmentGroup()) {
      return `Chat ${this.department}`;
    }
    return this.groupName;
  }
}

module.exports = GroupChat;
