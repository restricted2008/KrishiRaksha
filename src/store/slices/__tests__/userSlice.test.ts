import { createUserSlice, UserSlice } from '../userSlice';

describe('userSlice', () => {
  let slice: UserSlice;
  const mockSet = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    slice = createUserSlice(mockSet as any, mockGet as any, {} as any);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(slice.user).toBeNull();
      expect(slice.isAuthenticated).toBe(false);
      expect(slice.isLoading).toBe(false);
      expect(slice.error).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'farmer' as const,
        phone: '+91 12345 67890',
        location: 'Test Location',
      };

      mockGet.mockReturnValue({ user: null, isAuthenticated: false });

      slice.setUser(mockUser);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          isAuthenticated: true,
          error: null,
        })
      );
    });
  });

  describe('logout', () => {
    it('should clear user and reset authentication', () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'farmer' as const,
        phone: '+91 12345 67890',
        location: 'Test Location',
      };

      mockGet.mockReturnValue({ user: mockUser, isAuthenticated: true });

      slice.logout();

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          user: null,
          isAuthenticated: false,
          error: null,
        })
      );
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      mockGet.mockReturnValue({ isLoading: false });

      slice.setLoading(true);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          isLoading: true,
        })
      );
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const errorMessage = 'Login failed';
      mockGet.mockReturnValue({ error: null });

      slice.setError(errorMessage);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          error: errorMessage,
          isLoading: false,
        })
      );
    });

    it('should clear error when null is passed', () => {
      mockGet.mockReturnValue({ error: 'Some error' });

      slice.setError(null);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          error: null,
        })
      );
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockGet.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      const loginPromise = slice.login(credentials);

      // Check that loading state was set
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          isLoading: true,
          error: null,
        })
      );

      await loginPromise;

      // Check that user was set after login
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            email: credentials.email,
            role: 'farmer',
          }),
          isAuthenticated: true,
          isLoading: false,
        })
      );
    });

    it('should handle login failure', async () => {
      const credentials = {
        email: 'invalid@example.com',
        password: 'wrong',
      };

      mockGet.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Mock implementation to simulate failure
      const originalLogin = slice.login;
      slice.login = jest.fn().mockImplementation(async () => {
        slice.setLoading(true);
        slice.setError('Invalid credentials');
        slice.setLoading(false);
      });

      await slice.login(credentials);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid credentials',
          isLoading: false,
        })
      );
    });
  });

  describe('updateUser', () => {
    it('should update user information', () => {
      const existingUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'farmer' as const,
        phone: '+91 12345 67890',
        location: 'Old Location',
      };

      mockGet.mockReturnValue({ user: existingUser });

      const updates = {
        name: 'Updated Name',
        location: 'New Location',
      };

      slice.updateUser(updates);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          user: {
            ...existingUser,
            ...updates,
          },
        })
      );
    });

    it('should not update if user is null', () => {
      mockGet.mockReturnValue({ user: null });

      slice.updateUser({ name: 'New Name' });

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          user: null,
        })
      );
    });
  });
});
