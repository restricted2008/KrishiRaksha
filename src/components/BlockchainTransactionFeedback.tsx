import React from 'react';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle, RotateCcw, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { TransactionState } from '../hooks/useBlockchainTransaction';

interface BlockchainTransactionFeedbackProps {
  state: TransactionState;
  onRetry?: () => void;
  canRetry?: boolean;
  retryCount?: number;
  maxRetries?: number;
  onClose?: () => void;
  showExplorerLink?: boolean;
  explorerBaseUrl?: string;
}

const STATUS_CONFIG = {
  idle: {
    icon: Clock,
    title: 'Ready',
    color: '#9E9E9E',
    bgColor: '#F5F5F5',
    description: 'Ready to submit transaction'
  },
  pending: {
    icon: Loader2,
    title: 'Submitting Transaction',
    color: '#F9A825',
    bgColor: '#FFF3E0',
    description: 'Please wait while we submit your transaction to the blockchain...',
    animated: true
  },
  confirming: {
    icon: Clock,
    title: 'Confirming',
    color: '#039BE5',
    bgColor: '#E3F2FD',
    description: 'Transaction submitted! Waiting for confirmations...',
    animated: true
  },
  success: {
    icon: CheckCircle,
    title: 'Transaction Successful',
    color: '#2E7D32',
    bgColor: '#E8F5E8',
    description: 'Your transaction has been confirmed on the blockchain!'
  },
  failed: {
    icon: XCircle,
    title: 'Transaction Failed',
    color: '#C62828',
    bgColor: '#FFEBEE',
    description: 'Transaction failed to complete. You can retry the operation.'
  }
};

export const BlockchainTransactionFeedback: React.FC<BlockchainTransactionFeedbackProps> = ({
  state,
  onRetry,
  canRetry = false,
  retryCount = 0,
  maxRetries = 3,
  onClose,
  showExplorerLink = true,
  explorerBaseUrl = 'https://etherscan.io/tx/'
}) => {
  const config = STATUS_CONFIG[state.status];
  const Icon = config.icon;
  
  const getProgressPercentage = () => {
    if (state.status === 'pending') return 30;
    if (state.status === 'confirming' && state.confirmations && state.requiredConfirmations) {
      return 30 + (state.confirmations / state.requiredConfirmations) * 70;
    }
    if (state.status === 'success') return 100;
    return 0;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div 
      className="rounded-lg p-4 shadow-md"
      style={{ backgroundColor: config.bgColor }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress Bar */}
      {(state.status === 'pending' || state.status === 'confirming') && (
        <div 
          className="w-full h-1 rounded-full mb-4 overflow-hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
        >
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: config.color
            }}
          />
        </div>
      )}

      {/* Header with Icon */}
      <div className="flex items-start gap-3 mb-3">
        <div 
          className={`flex-shrink-0 ${config.animated ? 'animate-spin' : ''}`}
        >
          <Icon 
            className="w-6 h-6" 
            style={{ color: config.color }}
            aria-hidden="true"
          />
        </div>
        
        <div className="flex-1">
          <h4 
            className="font-semibold mb-1"
            style={{ color: config.color }}
          >
            {config.title}
          </h4>
          <p 
            className="text-sm"
            style={{ color: '#616161' }}
          >
            {config.description}
          </p>
        </div>
      </div>

      {/* Confirmation Progress */}
      {state.status === 'confirming' && state.confirmations !== undefined && state.requiredConfirmations && (
        <div 
          className="p-3 rounded-lg mb-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#212121' }}>
              Confirmations
            </span>
            <span className="text-sm font-bold" style={{ color: config.color }}>
              {state.confirmations} / {state.requiredConfirmations}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: state.requiredConfirmations }).map((_, index) => (
              <div
                key={index}
                className="flex-1 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index < state.confirmations ? config.color : '#E0E0E0'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transaction Hash */}
      {state.txHash && (
        <div 
          className="p-3 rounded-lg mb-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: '#616161' }}>
            Transaction Hash
          </p>
          <div className="flex items-center gap-2">
            <code 
              className="text-xs break-all"
              style={{ color: '#212121' }}
            >
              {state.txHash.substring(0, 10)}...{state.txHash.substring(state.txHash.length - 8)}
            </code>
            {showExplorerLink && (
              <a
                href={`${explorerBaseUrl}${state.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
                aria-label="View transaction on blockchain explorer"
              >
                <ExternalLink 
                  className="w-4 h-4" 
                  style={{ color: config.color }}
                />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.status === 'failed' && state.error && (
        <div 
          className="p-3 rounded-lg mb-3 flex items-start gap-2"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.7)',
            border: `1px solid ${config.color}`
          }}
        >
          <AlertTriangle 
            className="w-4 h-4 flex-shrink-0 mt-0.5" 
            style={{ color: config.color }}
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: config.color }}>
              Error Details
            </p>
            <p className="text-xs" style={{ color: '#616161' }}>
              {state.error}
            </p>
          </div>
        </div>
      )}

      {/* Retry Information */}
      {canRetry && retryCount > 0 && (
        <div 
          className="p-3 rounded-lg mb-3 text-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
        >
          <p className="text-xs" style={{ color: '#616161' }}>
            Retry attempt {retryCount} of {maxRetries}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {state.status === 'failed' && canRetry && onRetry && (
          <Button
            onClick={onRetry}
            className="flex-1 tap-target rounded-lg flex items-center justify-center gap-2"
            style={{
              backgroundColor: config.color,
              color: 'white',
              minHeight: '40px'
            }}
            aria-label={`Retry transaction (attempt ${retryCount + 1} of ${maxRetries})`}
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Retry Transaction
          </Button>
        )}

        {(state.status === 'success' || (state.status === 'failed' && !canRetry)) && onClose && (
          <Button
            onClick={onClose}
            className="flex-1 tap-target rounded-lg"
            style={{
              backgroundColor: state.status === 'success' ? config.color : '#616161',
              color: 'white',
              minHeight: '40px'
            }}
            aria-label="Close transaction feedback"
          >
            {state.status === 'success' ? 'Continue' : 'Close'}
          </Button>
        )}
      </div>

      {/* Loading Indicator Animation */}
      {(state.status === 'pending' || state.status === 'confirming') && (
        <div className="mt-3 flex justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: config.color,
                  animation: `pulse 1.4s ease-in-out ${index * 0.2}s infinite`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};
