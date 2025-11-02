import { StateCreator } from 'zustand';

export interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'batch' | 'shipment' | 'verification';
  data: any;
  timestamp: number;
  retryCount: number;
  error?: string;
}

export interface OfflineSyncSlice {
  // State
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: PendingOperation[];
  lastSyncTime: number | null;
  syncErrors: string[];

  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  addPendingOperation: (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => void;
  removePendingOperation: (id: string) => void;
  updatePendingOperation: (id: string, updates: Partial<PendingOperation>) => void;
  clearPendingOperations: () => void;
  startSync: () => void;
  completeSync: () => void;
  failSync: (error: string) => void;
  clearSyncErrors: () => void;
  getPendingCount: () => number;
}

export const createOfflineSyncSlice: StateCreator<OfflineSyncSlice> = (set, get) => ({
  // Initial State
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingOperations: [],
  lastSyncTime: null,
  syncErrors: [],

  // Actions
  setOnlineStatus: (isOnline) => {
    set({ isOnline });
    
    // Auto-trigger sync when coming back online
    if (isOnline && get().pendingOperations.length > 0) {
      get().startSync();
    }
  },

  addPendingOperation: (operation) => {
    const newOperation: PendingOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    set((state) => ({
      pendingOperations: [...state.pendingOperations, newOperation],
    }));
  },

  removePendingOperation: (id) =>
    set((state) => ({
      pendingOperations: state.pendingOperations.filter((op) => op.id !== id),
    })),

  updatePendingOperation: (id, updates) =>
    set((state) => ({
      pendingOperations: state.pendingOperations.map((op) =>
        op.id === id ? { ...op, ...updates } : op
      ),
    })),

  clearPendingOperations: () => set({ pendingOperations: [] }),

  startSync: () => {
    if (!get().isOnline || get().isSyncing) return;
    
    set({ isSyncing: true, syncErrors: [] });
    
    // In a real app, this would trigger actual sync logic
    setTimeout(() => {
      const operations = get().pendingOperations;
      
      // Simulate sync with 90% success rate
      if (Math.random() > 0.1) {
        set({
          isSyncing: false,
          pendingOperations: [],
          lastSyncTime: Date.now(),
        });
      } else {
        get().failSync('Sync failed: Network error');
      }
    }, 2000);
  },

  completeSync: () =>
    set({
      isSyncing: false,
      pendingOperations: [],
      lastSyncTime: Date.now(),
    }),

  failSync: (error) =>
    set((state) => ({
      isSyncing: false,
      syncErrors: [...state.syncErrors, error],
    })),

  clearSyncErrors: () => set({ syncErrors: [] }),

  getPendingCount: () => get().pendingOperations.length,
});
