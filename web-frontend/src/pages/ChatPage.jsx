import React, { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";

function ChatPage() {
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("private"); // 'private' or 'groups'
  const messagesEndRef = useRef(null);
  const [showSearch, setShowSearch] = useState(false);

  const {
    recentChats,
    currentConversation,
    activeChat,
    activeGroup,
    userGroups,
    groupMessages,
    searchResults,
    isLoading,
    error,
    setActiveChat,
    setActiveGroup,
    clearActiveChat,
    fetchRecentChats,
    fetchConversation,
    fetchUserGroups,
    fetchGroupMessages,
    sendMessage,
    sendGroupMessage,
    searchUsers,
    clearSearchResults,
    clearError,
  } = useChatStore();

  const { user } = useAuthStore();

  useEffect(() => {
    fetchRecentChats();
    fetchUserGroups();
  }, [fetchRecentChats, fetchUserGroups]);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation, groupMessages]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      clearSearchResults();
    }
  }, [searchQuery, searchUsers, clearSearchResults]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChatSelect = async (chat) => {
    setActiveChat(chat);
    await fetchConversation(chat.contactId);
    setShowSearch(false);
    setSearchQuery("");
    clearSearchResults();
  };

  const handleGroupSelect = async (group) => {
    setActiveGroup(group);
    await fetchGroupMessages(group.groupId);
    setActiveTab("groups");
  };

  const handleSearchResultSelect = async (user) => {
    const chat = {
      contactId: user.empId,
      contactName: user.fullName,
      contactPhoto: user.photo,
      contactDepartment: user.department,
      contactPosition: user.position,
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    };
    await handleChatSelect(chat);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      if (activeChat) {
        await sendMessage(activeChat.contactId, messageText);
      } else if (activeGroup) {
        await sendGroupMessage(activeGroup.groupId, messageText);
      }
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const getCurrentMessages = () => {
    if (activeChat) return currentConversation;
    if (activeGroup) return groupMessages;
    return [];
  };

  const getCurrentChatInfo = () => {
    if (activeChat) {
      return {
        name: activeChat.contactName,
        avatar: activeChat.contactPhoto,
        subtitle: `${activeChat.contactPosition} - ${activeChat.contactDepartment}`,
      };
    }
    if (activeGroup) {
      return {
        name: activeGroup.groupName,
        avatar: activeGroup.groupAvatar,
        subtitle: `${activeGroup.memberCount} thành viên`,
      };
    }
    return null;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2>
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) {
                  setSearchQuery("");
                  clearSearchResults();
                }
              }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tìm người để chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Search */}
          {showSearch && (
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm người để chat..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("private")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "private"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cá nhân
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "groups"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Nhóm
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Đóng
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Đang tải...
            </div>
          ) : (
            <>
              {/* Search Results */}
              {showSearch && searchResults.length > 0 && (
                <div className="border-b border-gray-200">
                  <div className="p-3 bg-gray-50">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kết quả tìm kiếm
                    </p>
                  </div>
                  {searchResults.map((user) => (
                    <div
                      key={user.empId}
                      onClick={() => handleSearchResultSelect(user)}
                      className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.photo || "/default-avatar.png"}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.position} - {user.department}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Private Chats */}
              {activeTab === "private" && (
                <>
                  {recentChats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-3 text-gray-300">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                        </svg>
                      </div>
                      <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Tìm kiếm người để bắt đầu chat
                      </p>
                    </div>
                  ) : (
                    recentChats.map((chat) => (
                      <div
                        key={chat.contactId}
                        onClick={() => handleChatSelect(chat)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                          activeChat?.contactId === chat.contactId
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {chat.contactPhoto ? (
                              <img
                                src={`http://localhost:3000/uploads/${chat.contactPhoto}`}
                                alt={chat.contactName}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${
                                chat.contactPhoto ? "hidden" : ""
                              }`}
                            >
                              {chat.contactName
                                ? chat.contactName.charAt(0).toUpperCase()
                                : "?"}
                            </div>
                            {chat.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {chat.unreadCount}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {chat.contactName}
                              </p>
                              <span className="text-xs text-gray-400">
                                {formatTime(chat.lastMessageTime)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {chat.isSentByMe ? "Bạn: " : ""}
                              {chat.lastMessage || "Chưa có tin nhắn"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Group Chats */}
              {activeTab === "groups" && (
                <>
                  {userGroups.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-3 text-gray-300">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.001 3.001 0 0 0 17 6.5c-.42 0-.82.11-1.16.3l.02.2c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-.07.01-.13.02-.2C9.52 6.61 9.12 6.5 8.7 6.5c-1.43 0-2.6 1-2.94 2.33L3 16h2.5v6h2V16h5v6h2z" />
                        </svg>
                      </div>
                      <p className="text-sm">Chưa có nhóm chat nào</p>
                    </div>
                  ) : (
                    userGroups.map((group) => (
                      <div
                        key={group.groupId}
                        onClick={() => handleGroupSelect(group)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                          activeGroup?.groupId === group.groupId
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {group.groupType === "department" ? "🏢" : "👥"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {group.groupName}
                              </p>
                              <span className="text-xs text-gray-400">
                                {group.lastActivity
                                  ? formatTime(group.lastActivity)
                                  : ""}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {group.lastMessage ||
                                `${group.memberCount} thành viên`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {activeChat || activeGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={clearActiveChat}
                  className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex items-center space-x-3">
                  {(() => {
                    const chatInfo = getCurrentChatInfo();
                    if (!chatInfo) return null;

                    return (
                      <>
                        {activeChat ? (
                          <>
                            {chatInfo.avatar ? (
                              <img
                                src={`http://localhost:3000/uploads/${chatInfo.avatar}`}
                                alt={chatInfo.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${
                                chatInfo.avatar ? "hidden" : ""
                              }`}
                            >
                              {chatInfo.name
                                ? chatInfo.name.charAt(0).toUpperCase()
                                : "?"}
                            </div>
                          </>
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {activeGroup?.groupType === "department"
                              ? "🏢"
                              : "👥"}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {chatInfo.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {chatInfo.subtitle}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {getCurrentMessages().map((message, index) => {
                const isCurrentUser =
                  message.senderId === user?.empId ||
                  message.senderName === "Bạn";

                return (
                  <div
                    key={message.messageId || index}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-xs lg:max-w-md ${
                        isCurrentUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {!isCurrentUser && (
                        <>
                          {message.senderPhoto ? (
                            <img
                              src={`http://localhost:3000/uploads/${message.senderPhoto}`}
                              alt={message.senderName}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold ${
                              message.senderPhoto ? "hidden" : ""
                            }`}
                          >
                            {message.senderName
                              ? message.senderName.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                        </>
                      )}
                      <div
                        className={`mx-2 ${isCurrentUser ? "mr-0" : "ml-0"}`}
                      >
                        {!isCurrentUser && (
                          <p className="text-xs text-gray-500 mb-1">
                            {message.senderName}
                          </p>
                        )}
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-900 border border-gray-200"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isCurrentUser ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {formatTime(message.sentAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 bg-white"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-gray-500">
                Chọn người hoặc nhóm để bắt đầu trò chuyện
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
