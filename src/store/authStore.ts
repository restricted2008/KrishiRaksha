import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export type UserRole = 'farmer' | 'distributor' | 'retailer' | 'consumer' | 'government' | null;

interface AuthState {
  user: User | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, userData: User) => void;
  register: (role: UserRole, userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userRole: null,
      isAuthenticated: false,
      
      login: (role, userData) => {
        set({
          user: userData,
          userRole: role,
          isAuthenticated: true,
        });
      },
      
      register: (role, userData) => {
        // Same as login for this implementation
        set({
          user: userData,
          userRole: role,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          userRole: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'krishiraksha_auth',
    }
  )
);
