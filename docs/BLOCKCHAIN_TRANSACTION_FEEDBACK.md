# Blockchain Transaction Feedback System

## Overview

The Krishiraksha application features a comprehensive blockchain transaction feedback system that provides real-time visual feedback for blockchain operations. The system includes animated progress indicators, color-coded status messages, automatic retry logic, and detailed transaction information.

## Features

### 🎨 Visual Feedback

- **Animated Progress Bar**: Shows transaction progress from submission to confirmation
- **Color-Coded States**: Different colors for each transaction state
- **Spinning Loader**: Animated spinner during pending and confirming states
- **Pulsing Indicators**: Three-dot animation for active transactions

### 📊 Transaction States

| State | Color | Icon | Description |
|-------|-------|------|-------------|
| `idle` | Gray (#9E9E9E) | Clock | Ready to submit |
| `pending` | Amber (#F9A825) | Loader2 (spinning) | Submitting to blockchain |
| `confirming` | Blue (#039BE5) | Clock (spinning) | Waiting for confirmations |
| `success` | Green (#2E7D32) | CheckCircle | Transaction confirmed |
| `failed` | Red (#C62828) | XCircle | Transaction failed |

### 🔄 Retry Support

- Automatic retry capability for failed transactions
- Configurable max retry attempts (default: 3)
- Configurable retry delay (default: 2000ms)
- Visual retry counter display

---

## Components

### BlockchainTransactionFeedback

Main component for displaying transaction status with full visual feedback.

**Props:**
```typescript
interface BlockchainTransactionFeedbackProps {
  state: TransactionState;           // Current transaction state
  onRetry?: () => void;              // Retry callback
  canRetry?: boolean;                // Whether retry is available
  retryCount?: number;               // Current retry attempt number
  maxRetries?: number;               // Maximum retry attempts
  onClose?: () => void;              // Close callback
  showExplorerLink?: boolean;        // Show blockchain explorer link
  explorerBaseUrl?: string;          // Base URL for explorer
}
```

**Usage:**
```tsx
import { BlockchainTransactionFeedback } from '../components/BlockchainTransactionFeedback';

<BlockchainTransactionFeedback
  state={blockchainTx.state}
  onRetry={handleRetry}
  canRetry={blockchainTx.canRetry}
  retryCount={blockchainTx.retryCount}
  maxRetries={3}
  onClose={handleClose}
  showExplorerLink={true}
/>
```

---

## Hooks

### useBlockchainTransaction

Custom hook for managing blockchain transaction state and logic.

**Options:**
```typescript
interface BlockchainTransactionOptions {
  onSuccess?: (txHash: string) => void;  // Success callback
  onError?: (error: Error) => void;      // Error callback
  requiredConfirmations?: number;        // Number of confirmations needed
  maxRetries?: number;                   // Max retry attempts
  retryDelay?: number;                   // Delay between retries (ms)
}
```

**Returns:**
```typescript
{
  state: TransactionState;              // Current state
  executeTransaction: (fn) => Promise<void>;  // Execute transaction
  retry: (fn) => Promise<void>;         // Retry failed transaction
  reset: () => void;                    // Reset state
  isLoading: boolean;                   // Loading indicator
  canRetry: boolean;                    // Retry availability
  retryCount: number;                   // Current retry count
  maxRetries: number;                   // Max retries allowed
}
```

**Usage:**
```tsx
import { useBlockchainTransaction } from '../hooks/useBlockchainTransaction';

const MyComponent = () => {
  const blockchainTx = useBlockchainTransaction({
    onSuccess: (txHash) => {
      console.log('Transaction confirmed:', txHash);
    },
    onError: (error) => {
      console.error('Transaction failed:', error);
    },
    requiredConfirmations: 3,
    maxRetries: 3
  });

  const handleUpdate = async () => {
    const transactionFn = async () => {
      // Your blockchain transaction logic
      return '0xabc123...'; // Return transaction hash
    };

    await blockchainTx.executeTransaction(transactionFn);
  };

  return (
    <div>
      <button onClick={handleUpdate} disabled={blockchainTx.isLoading}>
        Update Status
      </button>
      
      {blockchainTx.isLoading && <p>Processing...</p>}
    </div>
  );
};
```

---

## Implementation Examples

### SupplyChainUpdate Integration

```tsx
import { useBlockchainTransaction } from '../hooks/useBlockchainTransaction';
import { BlockchainTransactionFeedback } from '../components/BlockchainTransactionFeedback';

export const DistributorPanel = ({ user, onLogout }) => {
  const [showBlockchainFeedback, setShowBlockchainFeedback] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  
  const blockchainTx = useBlockchainTransaction({
    onSuccess: (txHash) => {
      showToast('success', 'Blockchain transaction confirmed!');
    },
    onError: (error) => {
      showToast('error', `Transaction failed: ${error.message}`);
    },
    requiredConfirmations: 3,
    maxRetries: 3
  });

  const handleStatusUpdate = async (shipmentId, newStatus) => {
    setShowBlockchainFeedback(true);
    
    const transactionFn = async () => {
      // Simulate blockchain transaction
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.2) {
            const txHash = `0x${Math.random().toString(16).substring(2, 42)}`;
            // Update shipment state
            resolve(txHash);
          } else {
            reject(new Error('Network error'));
          }
        }, 1500);
      });
    };
    
    setCurrentAction(() => transactionFn);
    await blockchainTx.executeTransaction(transactionFn);
  };

  return (
    <div>
      {/* Your component UI */}
      
      {showBlockchainFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md">
            <BlockchainTransactionFeedback
              state={blockchainTx.state}
              onRetry={() => blockchainTx.retry(currentAction)}
              canRetry={blockchainTx.canRetry}
              retryCount={blockchainTx.retryCount}
              maxRetries={blockchainTx.maxRetries}
              onClose={() => {
                setShowBlockchainFeedback(false);
                blockchainTx.reset();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

### ConsumerVerification Integration

```tsx
export const ConsumerApp = ({ user, onLogout }) => {
  const [showBlockchainFeedback, setShowBlockchainFeedback] = useState(false);
  const [verificationAction, setVerificationAction] = useState(null);
  
  const blockchainTx = useBlockchainTransaction({
    requiredConfirmations: 2,
    maxRetries: 3
  });

  const handleScan = async (qrData) => {
    setShowBlockchainFeedback(true);
    
    const verifyTransaction = async () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.15) {
            const txHash = `0x${Math.random().toString(16).substring(2, 42)}`;
            // Set scanned product
            resolve(txHash);
          } else {
            reject(new Error('Blockchain verification failed'));
          }
        }, 1000);
      });
    };
    
    setVerificationAction(() => verifyTransaction);
    await blockchainTx.executeTransaction(verifyTransaction);
  };

  return (
    <div>
      {/* Scanner UI */}
      
      {showBlockchainFeedback && (
        <BlockchainTransactionFeedback
          state={blockchainTx.state}
          onRetry={() => blockchainTx.retry(verificationAction)}
          canRetry={blockchainTx.canRetry}
          retryCount={blockchainTx.retryCount}
          maxRetries={blockchainTx.maxRetries}
          onClose={() => {
            setShowBlockchainFeedback(false);
            blockchainTx.reset();
          }}
        />
      )}
    </div>
  );
};
```

---

## Visual States Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Transaction Flow                             │
└─────────────────────────────────────────────────────────────────┘

    idle
     ↓ (executeTransaction)
  pending (🟡 Spinner)
     ↓ (tx submitted)
 confirming (🔵 Progress: 1/3, 2/3, 3/3)
     ↓ (all confirmations received)
  success (🟢 Checkmark)
  
  OR
  
  pending → failed (🔴 X icon)
              ↓ (retry button clicked)
           pending (retry attempt 1)
              ↓
           failed (retry attempt 2)
              ...
              ↓ (max retries exceeded)
           failed (no more retries)
```

---

## Confirmation Progress

The system visually tracks blockchain confirmations:

```tsx
// Example: 3 required confirmations
┌────────────────────────────────────┐
│ Confirmations: 2 / 3               │
│ ████████████░░░░░░░░░░              │
└────────────────────────────────────┘

// Visual bars show progress
[████] [████] [░░░░]
  ✓      ✓      ⋯
```

---

## Error Handling

### Error Display

```tsx
┌───────────────────────────────────────┐
│ ⚠️ Error Details                      │
│ Network error: Unable to connect to  │
│ blockchain                            │
└───────────────────────────────────────┘
```

### Retry Logic

1. **Automatic Retry Availability**: Failed transactions show retry button
2. **Retry Counter**: Displays current attempt (e.g., "Retry attempt 1 of 3")
3. **Retry Delay**: Configurable delay before retry (default 2000ms)
4. **Max Retries**: After max attempts, retry button is disabled

---

## Testing

### Unit Tests

Run blockchain transaction hook tests:

```bash
npm test -- useBlockchainTransaction.test.ts
```

**Test Coverage:**
- Initial state
- Successful transaction execution
- Failed transaction handling
- Retry logic
- Confirmation tracking
- State reset
- Callbacks (onSuccess, onError)

### Manual Testing

1. **Success Flow**:
   - Trigger transaction
   - Observe pending → confirming → success states
   - Verify progress bar animation
   - Check transaction hash display

2. **Failure Flow**:
   - Trigger transaction (use low probability for testing)
   - Observe failure state with error message
   - Click retry button
   - Verify retry counter updates

3. **Max Retries**:
   - Force multiple failures
   - Verify retry button disappears after max attempts
   - Check error message shows "Maximum retry attempts exceeded"

---

## Customization

### Colors

Update colors in `BlockchainTransactionFeedback.tsx`:

```typescript
const STATUS_CONFIG = {
  idle: { color: '#9E9E9E', bgColor: '#F5F5F5' },
  pending: { color: '#F9A825', bgColor: '#FFF3E0' },
  confirming: { color: '#039BE5', bgColor: '#E3F2FD' },
  success: { color: '#2E7D32', bgColor: '#E8F5E8' },
  failed: { color: '#C62828', bgColor: '#FFEBEE' }
};
```

### Confirmations

Adjust required confirmations per use case:

```tsx
// Fast confirmations for low-value transactions
useBlockchainTransaction({ requiredConfirmations: 1 })

// Standard confirmations
useBlockchainTransaction({ requiredConfirmations: 3 })

// High security for critical transactions
useBlockchainTransaction({ requiredConfirmations: 6 })
```

### Retry Configuration

```tsx
useBlockchainTransaction({
  maxRetries: 5,           // Allow more retries
  retryDelay: 5000        // Wait longer between retries
})
```

---

## Accessibility

### ARIA Labels

- All states have `aria-live="polite"` for screen reader updates
- Retry buttons include attempt numbers in `aria-label`
- Progress bars have semantic HTML for accessibility

### Keyboard Navigation

- Modal can be closed with Escape key (when integrated)
- All buttons are keyboard accessible
- Focus management during state transitions

---

## Best Practices

### 1. Always Show Feedback

```tsx
// ✅ Good - User sees transaction progress
const handleAction = async () => {
  setShowFeedback(true);
  await blockchainTx.executeTransaction(txFn);
};

// ❌ Bad - Silent transaction
const handleAction = async () => {
  await blockchainTx.executeTransaction(txFn);
};
```

### 2. Handle Errors Gracefully

```tsx
useBlockchainTransaction({
  onError: (error) => {
    // Log for debugging
    console.error('Blockchain error:', error);
    
    // Show user-friendly message
    showToast('error', 'Transaction failed. Please try again.');
  }
})
```

### 3. Reset State After Completion

```tsx
const handleClose = () => {
  setShowFeedback(false);
  blockchainTx.reset();  // ✅ Clean up state
  setCurrentAction(null);
};
```

### 4. Store Transaction Function Reference

```tsx
// ✅ Store function for retry
const [currentAction, setCurrentAction] = useState(null);
setCurrentAction(() => transactionFn);

// ❌ Don't recreate function on retry
const handleRetry = () => {
  blockchainTx.retry(/* need reference! */);
};
```

---

## Troubleshooting

### Transaction Stuck in Pending

**Issue**: Transaction never moves to confirming
**Solution**: Check that transaction function returns a valid tx hash

```tsx
const transactionFn = async () => {
  // Must return string (tx hash)
  return '0xabc123...';
};
```

### Confirmations Not Updating

**Issue**: Confirmation counter stays at 0
**Solution**: Verify confirmation simulation logic or real blockchain polling

### Retry Button Not Showing

**Issue**: Failed transactions don't show retry option
**Solution**: Ensure `canRetry` prop is passed and `onRetry` callback is provided

---

## Future Enhancements

- [ ] Real blockchain integration (replace simulation)
- [ ] MetaMask/Web3 wallet connection
- [ ] Gas fee estimation display
- [ ] Transaction history log
- [ ] Batch transaction support
- [ ] Custom error type handling
- [ ] Network congestion warnings

---

## Support

For issues or questions:
- Review test files for usage examples
- Check component props and hook options
- Test with simulation before connecting real blockchain

## License

Part of the Krishiraksha project - MIT License
