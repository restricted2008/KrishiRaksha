import CryptoJS from 'crypto-js';

// Secret key for HMAC verification - in production, this should be in env variables
const QR_SECRET_KEY = process.env.REACT_APP_QR_SECRET || 'krishiraksha-qr-secret-2024';

export interface FarmerQRData {
  batchId: string;
  cropType: string;
  farmer: string;
  harvestDate: string;
  location: string;
  quantity?: number;
  unit?: string;
  organicCertified?: boolean;
  timestamp: number;
  version: string;
}

export interface SecureQRPayload {
  data: FarmerQRData;
  signature: string;
}

/**
 * Generates a secure QR code payload with HMAC signature
 */
export const generateSecureQRData = (farmerData: Omit<FarmerQRData, 'timestamp' | 'version'>): string => {
  const qrData: FarmerQRData = {
    ...farmerData,
    timestamp: Date.now(),
    version: '1.0'
  };

  // Create HMAC signature
  const dataString = JSON.stringify(qrData);
  const signature = CryptoJS.HmacSHA256(dataString, QR_SECRET_KEY).toString();

  const payload: SecureQRPayload = {
    data: qrData,
    signature
  };

  return JSON.stringify(payload);
};

/**
 * Validates a scanned QR code and returns the data if valid
 */
export const validateQRData = (qrString: string): { 
  isValid: boolean; 
  data?: FarmerQRData; 
  error?: string;
  errorType?: 'TAMPERED' | 'EXPIRED' | 'INVALID_FORMAT' | 'MISSING_SIGNATURE';
} => {
  try {
    const payload: SecureQRPayload = JSON.parse(qrString);

    // Check if signature exists
    if (!payload.signature || !payload.data) {
      return {
        isValid: false,
        error: 'QR code is missing security signature',
        errorType: 'MISSING_SIGNATURE'
      };
    }

    // Verify signature
    const dataString = JSON.stringify(payload.data);
    const expectedSignature = CryptoJS.HmacSHA256(dataString, QR_SECRET_KEY).toString();

    if (payload.signature !== expectedSignature) {
      return {
        isValid: false,
        error: 'QR code has been tampered with or is invalid',
        errorType: 'TAMPERED'
      };
    }

    // Check if QR code is expired (valid for 30 days)
    const qrAge = Date.now() - payload.data.timestamp;
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    if (qrAge > maxAge) {
      return {
        isValid: false,
        error: 'QR code has expired',
        errorType: 'EXPIRED'
      };
    }

    // Validate required fields
    if (!payload.data.batchId || !payload.data.cropType || !payload.data.farmer) {
      return {
        isValid: false,
        error: 'QR code is missing required information',
        errorType: 'INVALID_FORMAT'
      };
    }

    return {
      isValid: true,
      data: payload.data
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid QR code format',
      errorType: 'INVALID_FORMAT'
    };
  }
};

/**
 * Formats QR data for display
 */
export const formatQRDataForDisplay = (data: FarmerQRData): string[] => {
  return [
    `Batch ID: ${data.batchId}`,
    `Crop: ${data.cropType}`,
    `Farmer: ${data.farmer}`,
    `Harvest Date: ${new Date(data.harvestDate).toLocaleDateString()}`,
    `Location: ${data.location}`,
    ...(data.quantity ? [`Quantity: ${data.quantity} ${data.unit || 'kg'}`] : []),
    ...(data.organicCertified ? ['✓ Organic Certified'] : []),
    `Generated: ${new Date(data.timestamp).toLocaleDateString()}`
  ];
};
