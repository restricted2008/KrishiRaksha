import { StateCreator } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'distributor' | 'retailer' | 'consumer';
  phone?: string;
  location?: string;
  farmName?: string;
  avatar?: string;
}

export interface UserSlice {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      error: null,
    }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data based on email
      const mockUser: User = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: email.includes('farmer') ? 'farmer' : 
              email.includes('distributor') ? 'distributor' :
              email.includes('retailer') ? 'retailer' : 'consumer',
        phone: '+91 98765 43210',
        location: 'Mumbai, India',
      };

      set({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  },

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    }),

  clearError: () => set({ error: null }),
});
