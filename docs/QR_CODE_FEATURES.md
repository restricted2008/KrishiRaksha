# QR Code Features Documentation

## Overview

The Krishiraksha application implements a secure QR code generation and scanning system for crop batch verification. The system uses cryptographic signatures (HMAC-SHA256) to ensure QR codes are tamper-proof and authentic.

## Features

### 🔐 Security Features

- **HMAC-SHA256 Signature**: Each QR code is cryptographically signed to prevent tampering
- **Timestamp Validation**: QR codes expire after 30 days to prevent reuse
- **Data Integrity**: Any modification to QR data invalidates the signature
- **Tamper Detection**: Instant detection and warning for invalid/tampered QR codes

### 📱 User Features

- **Dynamic QR Generation**: Real-time QR code creation for each crop batch
- **Camera-based Scanning**: Uses device camera for QR code scanning
- **Offline Support**: QR generation works offline
- **Visual Feedback**: Clear success/error states with color-coded modals
- **Accessibility**: Full keyboard navigation and ARIA labels

---

## QR Code Generation

### Implementation

QR codes are generated using the `qrcode.react` library with secure data payload:

```tsx
import { QRCode } from 'qrcode.react';
import { generateSecureQRData } from '../utils/qrUtils';

// Generate secure QR code
const qrString = generateSecureQRData({
  batchId: 'KR12345',
  cropType: 'rice',
  farmer: 'Ramesh Kumar',
  harvestDate: '2024-01-15',
  location: 'Punjab',
  quantity: 100,
  unit: 'kg',
  organicCertified: true
});

// Render QR code
<QRCode 
  value={qrString}
  size={200}
  level="H"  // High error correction
  includeMargin={true}
/>
```

### Data Structure

Each QR code contains:

```typescript
{
  data: {
    batchId: string;          // Unique batch identifier
    cropType: string;         // Type of crop
    farmer: string;           // Farmer name
    harvestDate: string;      // ISO date string
    location: string;         // Farm location
    quantity?: number;        // Quantity harvested
    unit?: string;            // Measurement unit (kg/quintal/ton)
    organicCertified?: boolean; // Organic certification status
    timestamp: number;        // Generation timestamp
    version: string;          // QR format version
  },
  signature: string;          // HMAC-SHA256 signature
}
```

### Usage in FarmerRegistration

```tsx
import { FarmerDashboard } from './pages/FarmerRegistration';

// QR code is automatically generated when viewing batch details
// Users can click the QR icon on any batch to view/share the QR code
```

---

## QR Code Scanning

### Implementation

The QRScanner component uses `html5-qrcode` library for camera-based scanning:

```tsx
import { QRScanner } from '../components/QRScanner';

function MyComponent() {
  const [showScanner, setShowScanner] = useState(false);

  const handleScanSuccess = (data: FarmerQRData) => {
    console.log('Scanned batch:', data);
    // Process the validated data
  };

  return (
    <>
      <button onClick={() => setShowScanner(true)}>
        Scan QR Code
      </button>

      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
}
```

### Validation Process

1. **Camera Access**: Requests camera permission
2. **Scan Detection**: Detects QR code in camera view
3. **Signature Verification**: Validates HMAC signature
4. **Timestamp Check**: Ensures QR is not expired
5. **Data Validation**: Confirms all required fields present
6. **Display/Alert**: Shows data or tamper warning

### Camera Permissions

The scanner handles camera permissions gracefully:

```typescript
// Automatic permission request
// User-friendly error messages if denied
// Instructions for enabling camera access
```

---

## Invalid QR Modal

### Error Types

The system detects and displays specific error types:

#### 1. **TAMPERED**
```
🔴 Security Warning
This QR code has been tampered with or modified.
Do not proceed with this transaction.
```

#### 2. **EXPIRED**
```
🟡 QR Code Expired
This QR code has exceeded its validity period (30 days).
Request an updated QR code from the farmer.
```

#### 3. **INVALID_FORMAT**
```
🟠 Invalid QR Code
This QR code format is not recognized or is corrupted.
Ensure you are scanning a valid Krishiraksha QR code.
```

#### 4. **MISSING_SIGNATURE**
```
🔴 Unsigned QR Code
This QR code is missing required security verification.
This may be a counterfeit.
```

### Usage

```tsx
import { InvalidQRModal } from '../components/InvalidQRModal';

<InvalidQRModal
  isOpen={showModal}
  onClose={handleClose}
  errorType="TAMPERED"
  errorMessage="QR code has been tampered with or is invalid"
/>
```

---

## Utility Functions

### `generateSecureQRData(data)`

Generates a cryptographically signed QR code payload.

**Parameters:**
- `data: Omit<FarmerQRData, 'timestamp' | 'version'>` - Batch data without timestamp and version

**Returns:**
- `string` - JSON string containing signed payload

**Example:**
```typescript
const qrString = generateSecureQRData({
  batchId: 'KR12345',
  cropType: 'rice',
  farmer: 'Ramesh Kumar',
  harvestDate: '2024-01-15',
  location: 'Punjab'
});
```

### `validateQRData(qrString)`

Validates a scanned QR code and returns the data if valid.

**Parameters:**
- `qrString: string` - Scanned QR code string

**Returns:**
```typescript
{
  isValid: boolean;
  data?: FarmerQRData;
  error?: string;
  errorType?: 'TAMPERED' | 'EXPIRED' | 'INVALID_FORMAT' | 'MISSING_SIGNATURE';
}
```

**Example:**
```typescript
const result = validateQRData(scannedString);

if (result.isValid) {
  console.log('Valid batch:', result.data);
} else {
  console.error('Invalid QR:', result.errorType, result.error);
}
```

### `formatQRDataForDisplay(data)`

Formats QR data for human-readable display.

**Parameters:**
- `data: FarmerQRData` - Validated QR data

**Returns:**
- `string[]` - Array of formatted lines

**Example:**
```typescript
const lines = formatQRDataForDisplay(qrData);
// [
//   'Batch ID: KR12345',
//   'Crop: rice',
//   'Farmer: Ramesh Kumar',
//   ...
// ]
```

---

## Testing

### Unit Tests (Jest)

Run QR utility tests:

```bash
npm test -- qrUtils.test.ts
```

**Test Coverage:**
- QR generation with signatures
- Signature validation
- Tamper detection
- Expiration handling
- Data formatting

### E2E Tests (Playwright)

Run end-to-end scanner tests:

```bash
npx playwright test e2e/qr-scanner.spec.ts
```

**Test Scenarios:**
- Scanner opening/closing
- Camera permissions
- Valid QR scanning
- Tampered QR detection
- Expired QR detection
- Keyboard navigation
- Accessibility

---

## Security Best Practices

### 1. Secret Key Management

**❌ Don't:**
```typescript
const SECRET = 'my-secret-123';  // Hardcoded
```

**✅ Do:**
```typescript
const SECRET = process.env.REACT_APP_QR_SECRET || 'fallback-secret';
```

Store the secret in environment variables:
```bash
# .env.local
REACT_APP_QR_SECRET=your-production-secret-key-here
```

### 2. QR Code Expiration

QR codes automatically expire after 30 days. Adjust if needed:

```typescript
// In qrUtils.ts
const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
```

### 3. Signature Algorithm

The system uses HMAC-SHA256. To change:

```typescript
// Current
const signature = CryptoJS.HmacSHA256(dataString, SECRET).toString();

// Alternative (stronger)
const signature = CryptoJS.HmacSHA512(dataString, SECRET).toString();
```

---

## User Flows

### Farmer Flow (QR Generation)

1. Farmer creates a crop batch
2. System generates unique batch ID
3. Batch details are cryptographically signed
4. QR code is displayed in batch view
5. Farmer can share/print QR code

### Buyer/Verifier Flow (QR Scanning)

1. Buyer clicks "Scan QR Code"
2. Camera permission requested
3. Camera viewfinder opens
4. QR code detected and validated
5. If valid: Batch details displayed
6. If invalid: Security warning shown
7. Buyer confirms or rescans

---

## Troubleshooting

### Camera Not Working

**Issue**: Camera doesn't start
**Solutions**:
- Check browser permissions
- Try HTTPS connection (required for camera)
- Check browser compatibility (Chrome, Safari, Edge)

### QR Code Not Scanning

**Issue**: Scanner doesn't detect QR
**Solutions**:
- Ensure good lighting
- Hold QR code steady
- Check QR code quality/size
- Try different angle/distance

### Validation Errors

**Issue**: Valid QR shows as invalid
**Solutions**:
- Check secret key matches between generation and validation
- Verify timestamp is not expired
- Ensure data structure is correct

---

## Browser Compatibility

| Browser | QR Generation | QR Scanning |
|---------|--------------|-------------|
| Chrome (Desktop) | ✅ | ✅ |
| Chrome (Mobile) | ✅ | ✅ |
| Safari (iOS) | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Edge | ✅ | ✅ |

**Note**: Camera scanning requires HTTPS in production.

---

## API Reference

### QRScanner Props

```typescript
interface QRScannerProps {
  isOpen: boolean;              // Scanner visibility
  onClose: () => void;          // Close handler
  onScanSuccess: (data: FarmerQRData) => void;  // Success callback
}
```

### InvalidQRModal Props

```typescript
interface InvalidQRModalProps {
  isOpen: boolean;              // Modal visibility
  onClose: () => void;          // Close handler
  errorType: 'TAMPERED' | 'EXPIRED' | 'INVALID_FORMAT' | 'MISSING_SIGNATURE';
  errorMessage: string;         // Detailed error message
}
```

---

## Future Enhancements

- [ ] QR code batch export (PDF/print)
- [ ] Blockchain integration for QR verification
- [ ] Multi-language QR data display
- [ ] QR code analytics/tracking
- [ ] Offline QR validation cache
- [ ] NFC tag integration

---

## Support

For issues or questions:
- Check test files for examples
- Review error messages in InvalidQRModal
- Test with mock data first

## License

Part of the Krishiraksha project - MIT License
