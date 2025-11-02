import { renderHook, act, waitFor } from '@testing-library/react';
import { useBlockchainTransaction } from '../useBlockchainTransaction';

// Mock setTimeout for faster tests
jest.useFakeTimers();

describe('useBlockchainTransaction', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should initialize with idle status', () => {
      const { result } = renderHook(() => useBlockchainTransaction());

      expect(result.current.state.status).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.canRetry).toBe(false);
      expect(result.current.retryCount).toBe(0);
    });

    it('should initialize with custom required confirmations', () => {
      const { result } = renderHook(() => 
        useBlockchainTransaction({ requiredConfirmations: 5 })
      );

      expect(result.current.state.requiredConfirmations).toBe(5);
    });
  });

  describe('Transaction Execution', () => {
    it('should successfully execute transaction', async () => {
      const mockTxHash = '0xabc123';
      const mockTransactionFn = jest.fn().mockResolvedValue(mockTxHash);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => 
        useBlockchainTransaction({ onSuccess, requiredConfirmations: 2 })
      );

      await act(async () => {
        await result.current.executeTransaction(mockTransactionFn);
      });

      // Fast-forward through confirmations
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(mockTransactionFn).toHaveBeenCalledTimes(1);
      expect(result.current.state.status).toBe('success');
      expect(result.current.state.txHash).toBe(mockTxHash);
      expect(onSuccess).toHaveBeenCalledWith(mockTxHash);
    });

    it('should set pending status when transaction starts', async () => {
      const mockTransactionFn = jest.fn().mockResolvedValue('0xabc123');

      const { result } = renderHook(() => useBlockchainTransaction());

      act(() => {
        result.current.executeTransaction(mockTransactionFn);
      });

      expect(result.current.state.status).toBe('pending');
      expect(result.current.isLoading).toBe(true);
    });

    it('should transition to confirming status after transaction submission', async () => {
      const mockTxHash = '0xabc123';
      const mockTransactionFn = jest.fn().mockResolvedValue(mockTxHash);

      const { result } = renderHook(() => useBlockchainTransaction());

      await act(async () => {
        const promise = result.current.executeTransaction(mockTransactionFn);
        await Promise.resolve(); // Wait for transaction to resolve
        return promise;
      });

      expect(result.current.state.status).toBe('confirming');
      expect(result.current.state.txHash).toBe(mockTxHash);
    });

    it('should track confirmations during confirming phase', async () => {
      const mockTransactionFn = jest.fn().mockResolvedValue('0xabc123');

      const { result } = renderHook(() => 
        useBlockchainTransaction({ requiredConfirmations: 3 })
      );

      await act(async () => {
        const promise = result.current.executeTransaction(mockTransactionFn);
        
        // Advance timer for each confirmation
        for (let i = 0; i < 3; i++) {
          jest.advanceTimersByTime(1000);
          await Promise.resolve();
        }
        
        return promise;
      });

      expect(result.current.state.confirmations).toBe(3);
      expect(result.current.state.status).toBe('success');
    });

    it('should handle transaction failure', async () => {
      const mockError = new Error('Transaction failed');
      const mockTransactionFn = jest.fn().mockRejectedValue(mockError);
      const onError = jest.fn();

      const { result } = renderHook(() => 
        useBlockchainTransaction({ onError })
      );

      await act(async () => {
        await result.current.executeTransaction(mockTransactionFn);
      });

      expect(result.current.state.status).toBe('failed');
      expect(result.current.state.error).toBe('Transaction failed');
      expect(onError).toHaveBeenCalledWith(mockError);
      expect(result.current.canRetry).toBe(true);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed transaction', async () => {
      const mockTransactionFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce('0xabc123');

      const { result } = renderHook(() => 
        useBlockchainTransaction({ maxRetries: 3 })
      );

      // First attempt - fails
      await act(async () => {
        await result.current.executeTransaction(mockTransactionFn);
      });

      expect(result.current.state.status).toBe('failed');
      expect(result.current.canRetry).toBe(true);

      // Retry
      await act(async () => {
        const promise = result.current.retry(mockTransactionFn);
        jest.advanceTimersByTime(2000); // Wait for retry delay
        await Promise.resolve();
        jest.advanceTimersByTime(3000); // Wait for confirmations
        return promise;
      });

      expect(result.current.retryCount).toBe(1);
      expect(result.current.state.status).toBe('success');
    });

    it('should not retry beyond max retries', async () => {
      const mockTransactionFn = jest.fn().mockRejectedValue(new Error('Always fails'));

      const { result } = renderHook(() => 
        useBlockchainTransaction({ maxRetries: 2 })
      );

      // Initial attempt
      await act(async () => {
        await result.current.executeTransaction(mockTransactionFn);
      });

      // Retry 1
      await act(async () => {
        await result.current.retry(mockTransactionFn);
        jest.advanceTimersByTime(2000);
      });

      // Retry 2
      await act(async () => {
        await result.current.retry(mockTransactionFn);
        jest.advanceTimersByTime(2000);
      });

      // Attempt retry 3 (should not execute)
      await act(async () => {
        await result.current.retry(mockTransactionFn);
      });

      expect(result.current.retryCount).toBe(2);
      expect(result.current.canRetry).toBe(false);
      expect(result.current.state.error).toContain('Maximum retry attempts');
    });

    it('should wait for retry delay before retrying', async () => {
      const mockTransactionFn = jest.fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce('0xabc123');

      const { result } = renderHook(() => 
        useBlockchainTransaction({ retryDelay: 5000 })
      );

      await act(async () => {
        await result.current.executeTransaction(mockTransactionFn);
      });

      const retryPromise = act(async () => {
        return result.current.retry(mockTransactionFn);
      });

      // Should not execute immediately
      expect(mockTransactionFn).toHaveBeenCalledTimes(1);

      // Advance past retry delay
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      await retryPromise;

      // Should have executed retry
      expect(mockTransactionFn).toHaveBeenCalledTimes(2);
    });

    it('should reset retry count on successful transaction', async () => {
      const mockTransactionFn = jest.fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce('0xabc123');

      const { result } = renderHook(() => useBlockchainTransaction());

      // Fail first attempt
      await act(async () => {
        await result.current.executeTransaction(mockTransactionFn);
      });

      expect(result.current.retryCount).toBe(0);

      // Retry and succeed
      await act(async () => {
        const promise = result.current.retry(mockTransactionFn);
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
        jest.advanceTimersByTime(3000);
        return promise;
      });

      expect(result.current.retryCount).toBe(0); // Reset on success
      expect(result.current.state.status).toBe('success');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset transaction state', async () => {
      const mockTransactionFn = jest.fn().mockResolvedValue('0xabc123');

      const { result } = renderHook(() => useBlockchainTransaction());

      await act(async () => {
        const promise = result.current.executeTransaction(mockTransactionFn);
        jest.advanceTimersByTime(3000);
        await promise;
      });

      expect(result.current.state.status).toBe('success');

      act(() => {
        result.current.reset();
      });

      expect(result.current.state.status).toBe('idle');
      expect(result.current.state.txHash).toBeUndefined();
      expect(result.current.retryCount).toBe(0);
    });
  });

  describe('Loading State', () => {
    it('should indicate loading during pending state', () => {
      const { result } = renderHook(() => useBlockchainTransaction());

      act(() => {
        result.current.executeTransaction(jest.fn().mockResolvedValue('0xabc'));
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should indicate loading during confirming state', async () => {
      const mockTransactionFn = jest.fn().mockResolvedValue('0xabc123');

      const { result } = renderHook(() => useBlockchainTransaction());

      await act(async () => {
        result.current.executeTransaction(mockTransactionFn);
        await Promise.resolve();
      });

      expect(result.current.state.status).toBe('confirming');
      expect(result.current.isLoading).toBe(true);
    });

    it('should not indicate loading after success', async () => {
      const mockTransactionFn = jest.fn().mockResolvedValue('0xabc123');

      const { result } = renderHook(() => 
        useBlockchainTransaction({ requiredConfirmations: 2 })
      );

      await act(async () => {
        const promise = result.current.executeTransaction(mockTransactionFn);
        jest.advanceTimersByTime(2000);
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback with tx hash', async () => {
      const mockTxHash = '0xabc123';
      const onSuccess = jest.fn();
      const mockTransactionFn = jest.fn().mockResolvedValue(mockTxHash);

      const { result } = renderHook(() => 
        useBlockchainTransaction({ onSuccess, requiredConfirmations: 1 })
      );

      await act(async () => {
        const promise = result.current.executeTransaction(mockTransactionFn);
        jest.advanceTimersByTime(1000);
        await promise;
      });

      expect(onSuccess).toHaveBeenCalledWith(mockTxHash);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('should call onError callback on failure', async () => {
      const mockError = new Error('Transaction error');
      const onError = jest.fn();
      const mockTransactionFn = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => 
        useBlockchainTransaction({ onError })
      );

      await act(async () => {
        await result.current.executeTransaction(mockTransactionFn);
      });

      expect(onError).toHaveBeenCalledWith(mockError);
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });
});
