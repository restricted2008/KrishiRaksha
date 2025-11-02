import { useState, useCallback } from 'react';

export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'failed';

export interface TransactionState {
  status: TransactionStatus;
  txHash?: string;
  error?: string;
  confirmations?: number;
  requiredConfirmations?: number;
}

export interface BlockchainTransactionOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  requiredConfirmations?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Custom hook for managing blockchain transaction state with retry logic
 */
export const useBlockchainTransaction = (options: BlockchainTransactionOptions = {}) => {
  const {
    onSuccess,
    onError,
    requiredConfirmations = 3,
    maxRetries = 3,
    retryDelay = 2000
  } = options;

  const [state, setState] = useState<TransactionState>({
    status: 'idle',
    requiredConfirmations
  });
  
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Execute blockchain transaction
   */
  const executeTransaction = useCallback(async (
    transactionFn: () => Promise<string>
  ): Promise<void> => {
    try {
      setState({
        status: 'pending',
        requiredConfirmations
      });

      // Execute the transaction function
      const txHash = await transactionFn();

      setState(prev => ({
        ...prev,
        status: 'confirming',
        txHash,
        confirmations: 0
      }));

      // Simulate confirmation tracking (in real app, this would poll the blockchain)
      await simulateConfirmations(txHash);

      setState(prev => ({
        ...prev,
        status: 'success',
        confirmations: requiredConfirmations
      }));

      onSuccess?.(txHash);
      setRetryCount(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      
      setState({
        status: 'failed',
        error: errorMessage,
        requiredConfirmations
      });

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [requiredConfirmations, onSuccess, onError]);

  /**
   * Retry failed transaction
   */
  const retry = useCallback(async (
    transactionFn: () => Promise<string>
  ): Promise<void> => {
    if (retryCount >= maxRetries) {
      setState(prev => ({
        ...prev,
        error: `Maximum retry attempts (${maxRetries}) exceeded`
      }));
      return;
    }

    setRetryCount(prev => prev + 1);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    await executeTransaction(transactionFn);
  }, [retryCount, maxRetries, retryDelay, executeTransaction]);

  /**
   * Reset transaction state
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      requiredConfirmations
    });
    setRetryCount(0);
  }, [requiredConfirmations]);

  /**
   * Simulate blockchain confirmations (replace with real blockchain polling)
   */
  const simulateConfirmations = async (txHash: string): Promise<void> => {
    for (let i = 1; i <= requiredConfirmations; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setState(prev => ({
        ...prev,
        confirmations: i
      }));
    }
  };

  return {
    state,
    executeTransaction,
    retry,
    reset,
    isLoading: state.status === 'pending' || state.status === 'confirming',
    canRetry: state.status === 'failed' && retryCount < maxRetries,
    retryCount,
    maxRetries
  };
};
