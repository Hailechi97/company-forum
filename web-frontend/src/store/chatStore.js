import { create } from "zustand";
import apiClient from "../services/api";

export const useChatStore = create((set, get) => ({
  // State
  recentChats: [],
  currentConversation: [],
  activeChat: null,
  activeGroup: null,
  userGroups: [],
  groupMessages: [],
  searchResults: [],
  isLoading: false,
  error: null,
  unreadCount: 0,

  // Actions
  setActiveChat: (chat) =>
    set({
      activeChat: chat,
      activeGroup: null,
      currentConversation: [],
    }),

  setActiveGroup: (group) =>
    set({
      activeGroup: group,
      activeChat: null,
      groupMessages: [],
    }),

  clearActiveChat: () =>
    set({
      activeChat: null,
      activeGroup: null,
      currentConversation: [],
      groupMessages: [],
    }),

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  setSearchResults: (results) => set({ searchResults: results }),
  clearSearchResults: () => set({ searchResults: [] }),

  // API Actions

  // Fetch recent conversations
  fetchRecentChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/messages/recent");
      if (response.data.success) {
        const totalUnread = response.data.data.reduce(
          (total, chat) => total + (chat.unreadCount || 0),
          0
        );
        set({
          recentChats: response.data.data,
          unreadCount: totalUnread,
        });
      }
    } catch (error) {
      console.error("Error fetching recent chats:", error);
      set({ error: "Không thể tải danh sách cuộc trò chuyện" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch conversation with a specific user
  fetchConversation: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/messages/conversation/${userId}`);
      if (response.data.success) {
        set({ currentConversation: response.data.data });
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      set({ error: "Không thể tải cuộc trò chuyện" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Send a message
  sendMessage: async (receiverId, content) => {
    try {
      const response = await apiClient.post("/messages/send", {
        receiverId,
        content,
      });

      if (response.data.success) {
        // Refresh conversation to get the complete message data
        const { activeChat } = get();
        if (activeChat) {
          await get().fetchConversation(activeChat.contactId);
        }

        // Refresh recent chats to update last message
        get().fetchRecentChats();

        return response.data.data;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      set({ error: "Không thể gửi tin nhắn" });
      throw error;
    }
  },

  // Search users
  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(
        `/messages/search?q=${encodeURIComponent(query)}`
      );
      if (response.data.success) {
        set({ searchResults: response.data.data });
      }
    } catch (error) {
      console.error("Error searching users:", error);
      set({ error: "Không thể tìm kiếm người dùng" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch user groups
  fetchUserGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/messages/groups");
      if (response.data.success) {
        set({ userGroups: response.data.data });
      }
    } catch (error) {
      console.error("Error fetching user groups:", error);
      set({ error: "Không thể tải danh sách nhóm" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch group messages
  fetchGroupMessages: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/messages/group/${groupId}`);
      if (response.data.success) {
        set({ groupMessages: response.data.data });
      }
    } catch (error) {
      console.error("Error fetching group messages:", error);
      set({ error: "Không thể tải tin nhắn nhóm" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Send group message
  sendGroupMessage: async (groupId, content) => {
    try {
      const response = await apiClient.post(`/messages/group/${groupId}`, {
        content,
      });

      if (response.data.success) {
        // Refresh group messages to get the complete message data
        await get().fetchGroupMessages(groupId);

        return response.data.data;
      }
    } catch (error) {
      console.error("Error sending group message:", error);
      set({ error: "Không thể gửi tin nhắn nhóm" });
      throw error;
    }
  },

  // Get unread count
  fetchUnreadCount: async () => {
    try {
      const response = await apiClient.get("/messages/unread-count");
      if (response.data.success) {
        set({ unreadCount: response.data.data.unreadCount });
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  },
}));
