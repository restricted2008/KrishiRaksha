import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createUserSlice, UserSlice } from './slices/userSlice';
import { createRegistrationSlice, RegistrationSlice } from './slices/registrationSlice';
import { createLanguageSlice, LanguageSlice } from './slices/languageSlice';
import { createOfflineSyncSlice, OfflineSyncSlice } from './slices/offlineSyncSlice';

// Combined store type
export type AppStore = UserSlice & RegistrationSlice & LanguageSlice & OfflineSyncSlice;

/**
 * Main application store using Zustand
 * 
 * Features:
 * - User authentication and profile
 * - Registration form progress
 * - Language/i18n state
 * - Offline sync queue
 * - Persistent storage via localStorage
 * 
 * @example
 * ```tsx
 * import { useAppStore } from './store';
 * 
 * function MyComponent() {
 *   const user = useAppStore((state) => state.user);
 *   const login = useAppStore((state) => state.login);
 *   
 *   return <div>{user?.name}</div>;
 * }
 * ```
 */
export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createRegistrationSlice(...a),
      ...createLanguageSlice(...a),
      ...createOfflineSyncSlice(...a),
    }),
    {
      name: 'krishiraksha-store', // localStorage key
      storage: createJSONStorage(() => localStorage),
      
      // Specify which parts of the store to persist
      partialize: (state) => ({
        // User slice
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        
        // Registration slice
        registrationData: state.registrationData,
        currentStep: state.currentStep,
        isCompleted: state.isCompleted,
        
        // Language slice
        currentLanguage: state.currentLanguage,
        
        // Offline sync slice
        pendingOperations: state.pendingOperations,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

// Selectors for convenient access
export const selectUser = (state: AppStore) => state.user;
export const selectIsAuthenticated = (state: AppStore) => state.isAuthenticated;
export const selectCurrentLanguage = (state: AppStore) => state.currentLanguage;
export const selectPendingOperations = (state: AppStore) => state.pendingOperations;
export const selectIsOnline = (state: AppStore) => state.isOnline;
export const selectRegistrationProgress = (state: AppStore) => ({
  currentStep: state.currentStep,
  totalSteps: state.totalSteps,
  data: state.registrationData,
  isCompleted: state.isCompleted,
});

// Hooks for specific slices
export const useUser = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
}));

export const useRegistration = () => useAppStore((state) => ({
  data: state.registrationData,
  currentStep: state.currentStep,
  totalSteps: state.totalSteps,
  isCompleted: state.isCompleted,
  updateData: state.updateRegistrationData,
  nextStep: state.nextStep,
  prevStep: state.prevStep,
  complete: state.completeRegistration,
  reset: state.resetRegistration,
}));

export const useLanguage = () => useAppStore((state) => ({
  current: state.currentLanguage,
  available: state.availableLanguages,
  isRTL: state.isRTL,
  setLanguage: state.setLanguage,
  toggle: state.toggleLanguage,
}));

export const useOfflineSync = () => useAppStore((state) => ({
  isOnline: state.isOnline,
  isSyncing: state.isSyncing,
  pendingOperations: state.pendingOperations,
  pendingCount: state.getPendingCount(),
  lastSyncTime: state.lastSyncTime,
  syncErrors: state.syncErrors,
  addOperation: state.addPendingOperation,
  removeOperation: state.removePendingOperation,
  startSync: state.startSync,
  setOnlineStatus: state.setOnlineStatus,
}));

// Initialize online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useAppStore.getState().setOnlineStatus(false);
  });
}
