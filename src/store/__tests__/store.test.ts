import { renderHook, act } from '@testing-library/react';
import { useAppStore, useUser, useRegistration, useLanguage, useOfflineSync } from '../index';

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({
    user: null,
    isAuthenticated: false,
    registrationData: {},
    currentStep: 0,
    isCompleted: false,
    currentLanguage: 'en',
    pendingOperations: [],
    isOnline: true,
  });
});

describe('User Slice', () => {
  it('should initialize with no user', () => {
    const { result } = renderHook(() => useUser());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set user on login', async () => {
    const { result } = renderHook(() => useUser());

    await act(async () => {
      await result.current.login('farmer@test.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe('farmer@test.com');
    expect(result.current.user?.role).toBe('farmer');
  });

  it('should update user profile', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setUser({
        id: '123',
        name: 'Test User',
        email: 'test@test.com',
        role: 'farmer',
      });
    });

    act(() => {
      result.current.updateUser({ name: 'Updated Name' });
    });

    expect(result.current.user?.name).toBe('Updated Name');
  });

  it('should logout and clear user', () => {
    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.login('test@test.com', 'password');
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe('Registration Slice', () => {
  it('should initialize with empty registration data', () => {
    const { result } = renderHook(() => useRegistration());

    expect(result.current.data).toEqual({});
    expect(result.current.currentStep).toBe(0);
    expect(result.current.isCompleted).toBe(false);
  });

  it('should update registration data', () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.updateData({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    expect(result.current.data.name).toBe('John Doe');
    expect(result.current.data.email).toBe('john@example.com');
  });

  it('should navigate through steps', () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(2);

    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('should not go below step 0', () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.prevStep();
    });

    expect(result.current.currentStep).toBe(0);
  });

  it('should complete registration', () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.complete();
    });

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.currentStep).toBe(result.current.totalSteps);
  });

  it('should reset registration', () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.updateData({ name: 'Test' });
      result.current.nextStep();
      result.current.complete();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toEqual({});
    expect(result.current.currentStep).toBe(0);
    expect(result.current.isCompleted).toBe(false);
  });
});

describe('Language Slice', () => {
  it('should initialize with English', () => {
    const { result } = renderHook(() => useLanguage());

    expect(result.current.current).toBe('en');
    expect(result.current.isRTL).toBe(false);
  });

  it('should change language', () => {
    const { result } = renderHook(() => useLanguage());

    act(() => {
      result.current.setLanguage('hi');
    });

    expect(result.current.current).toBe('hi');
  });

  it('should toggle between languages', () => {
    const { result } = renderHook(() => useLanguage());

    act(() => {
      result.current.toggle();
    });
    expect(result.current.current).toBe('hi');

    act(() => {
      result.current.toggle();
    });
    expect(result.current.current).toBe('en');
  });
});

describe('Offline Sync Slice', () => {
  it('should initialize as online', () => {
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.pendingOperations).toEqual([]);
  });

  it('should add pending operation', () => {
    const { result } = renderHook(() => useOfflineSync());

    act(() => {
      result.current.addOperation({
        type: 'create',
        entity: 'batch',
        data: { name: 'Test Batch' },
      });
    });

    expect(result.current.pendingOperations).toHaveLength(1);
    expect(result.current.pendingCount).toBe(1);
    expect(result.current.pendingOperations[0].entity).toBe('batch');
  });

  it('should remove pending operation', () => {
    const { result } = renderHook(() => useOfflineSync());

    let operationId: string;

    act(() => {
      result.current.addOperation({
        type: 'create',
        entity: 'batch',
        data: {},
      });
      operationId = result.current.pendingOperations[0].id;
    });

    act(() => {
      result.current.removeOperation(operationId);
    });

    expect(result.current.pendingOperations).toHaveLength(0);
  });

  it('should track online status', () => {
    const { result } = renderHook(() => useOfflineSync());

    act(() => {
      result.current.setOnlineStatus(false);
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      result.current.setOnlineStatus(true);
    });
    expect(result.current.isOnline).toBe(true);
  });

  it('should start sync when coming back online with pending operations', () => {
    const { result } = renderHook(() => useOfflineSync());

    act(() => {
      result.current.setOnlineStatus(false);
      result.current.addOperation({
        type: 'create',
        entity: 'batch',
        data: {},
      });
    });

    expect(result.current.isSyncing).toBe(false);

    act(() => {
      result.current.setOnlineStatus(true);
    });

    expect(result.current.isSyncing).toBe(true);
  });
});

describe('Store Persistence', () => {
  it('should persist user state to localStorage', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setUser({
        id: '123',
        name: 'Test User',
        email: 'test@test.com',
        role: 'farmer',
      });
    });

    // Check localStorage
    const stored = localStorage.getItem('krishiraksha-store');
    expect(stored).not.toBeNull();
    
    const parsed = JSON.parse(stored!);
    expect(parsed.state.user.name).toBe('Test User');
  });

  it('should persist language preference', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setLanguage('hi');
    });

    const stored = localStorage.getItem('krishiraksha-store');
    const parsed = JSON.parse(stored!);
    expect(parsed.state.currentLanguage).toBe('hi');
  });

  it('should persist pending operations', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.addPendingOperation({
        type: 'create',
        entity: 'batch',
        data: { test: 'data' },
      });
    });

    const stored = localStorage.getItem('krishiraksha-store');
    const parsed = JSON.parse(stored!);
    expect(parsed.state.pendingOperations).toHaveLength(1);
  });
});

describe('Selectors', () => {
  it('should select user from store', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setUser({
        id: '123',
        name: 'Test',
        email: 'test@test.com',
        role: 'farmer',
      });
    });

    const user = useAppStore.getState().user;
    expect(user?.name).toBe('Test');
  });

  it('should select registration progress', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.updateRegistrationData({ name: 'Test' });
      result.current.nextStep();
    });

    const state = useAppStore.getState();
    expect(state.currentStep).toBe(1);
    expect(state.registrationData.name).toBe('Test');
  });
});
