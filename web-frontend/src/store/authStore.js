import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Initialize auth from storage
      initializeAuth: () => {
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("user_data");

        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            set({ user, token });
          } catch (error) {
            console.error("Failed to parse user data:", error);
            get().logout();
          }
        }
      },

      // Login
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.auth.login(credentials);
          const { user, token } = response.data.data;

          // Store in localStorage
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user_data", JSON.stringify(user));

          set({ user, token, isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Login failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.auth.register(userData);
          const { user, token } = response.data.data;

          // Store in localStorage
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user_data", JSON.stringify(user));

          set({ user, token, isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Registration failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // Logout
      logout: async () => {
        try {
          await api.auth.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear storage and state
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          set({ user: null, token: null, error: null });
        }
      },

      // Update user profile
      updateUser: (userData) => {
        const updatedUser = { ...get().user, ...userData };
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
        set({ user: updatedUser });
      },

      // Check if user is authenticated
      isAuthenticated: () => {
        return !!get().token && !!get().user;
      },

      // Get current user (alias for user)
      get currentUser() {
        return get().user;
      },

      // Check if user has specific role
      hasRole: (role) => {
        const user = get().user;
        return user?.role === role;
      },

      // Check if user is admin or moderator
      isModerator: () => {
        const user = get().user;
        return user?.role === "admin" || user?.role === "moderator";
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
