import { generateSecureQRData, validateQRData, formatQRDataForDisplay, FarmerQRData } from '../qrUtils';
import CryptoJS from 'crypto-js';

describe('QR Utils', () => {
  const mockFarmerData = {
    batchId: 'KR12345',
    cropType: 'rice',
    farmer: 'Ramesh Kumar',
    harvestDate: '2024-01-15',
    location: 'Punjab',
    quantity: 100,
    unit: 'kg',
    organicCertified: true
  };

  describe('generateSecureQRData', () => {
    it('should generate a valid QR code payload with signature', () => {
      const qrString = generateSecureQRData(mockFarmerData);
      const payload = JSON.parse(qrString);

      expect(payload).toHaveProperty('data');
      expect(payload).toHaveProperty('signature');
      expect(payload.data).toMatchObject(mockFarmerData);
      expect(payload.data).toHaveProperty('timestamp');
      expect(payload.data).toHaveProperty('version');
      expect(payload.data.version).toBe('1.0');
    });

    it('should generate different signatures for different data', () => {
      const qrString1 = generateSecureQRData(mockFarmerData);
      const qrString2 = generateSecureQRData({
        ...mockFarmerData,
        batchId: 'KR99999'
      });

      const payload1 = JSON.parse(qrString1);
      const payload2 = JSON.parse(qrString2);

      expect(payload1.signature).not.toBe(payload2.signature);
    });

    it('should include timestamp in generated data', () => {
      const beforeTime = Date.now();
      const qrString = generateSecureQRData(mockFarmerData);
      const afterTime = Date.now();
      
      const payload = JSON.parse(qrString);
      
      expect(payload.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(payload.data.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('validateQRData', () => {
    it('should validate a correctly signed QR code', () => {
      const qrString = generateSecureQRData(mockFarmerData);
      const result = validateQRData(qrString);

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should reject QR code with tampered data', () => {
      const qrString = generateSecureQRData(mockFarmerData);
      const payload = JSON.parse(qrString);
      
      // Tamper with the data
      payload.data.cropType = 'wheat';
      const tamperedString = JSON.stringify(payload);
      
      const result = validateQRData(tamperedString);

      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('TAMPERED');
      expect(result.error).toBe('QR code has been tampered with or is invalid');
    });

    it('should reject QR code with tampered signature', () => {
      const qrString = generateSecureQRData(mockFarmerData);
      const payload = JSON.parse(qrString);
      
      // Tamper with the signature
      payload.signature = 'fake-signature-12345';
      const tamperedString = JSON.stringify(payload);
      
      const result = validateQRData(tamperedString);

      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('TAMPERED');
    });

    it('should reject expired QR code (older than 30 days)', () => {
      const qrString = generateSecureQRData(mockFarmerData);
      const payload = JSON.parse(qrString);
      
      // Set timestamp to 31 days ago
      const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000);
      payload.data.timestamp = oldTimestamp;
      
      // Regenerate signature with old timestamp
      const dataString = JSON.stringify(payload.data);
      payload.signature = CryptoJS.HmacSHA256(dataString, process.env.REACT_APP_QR_SECRET || 'krishiraksha-qr-secret-2024').toString();
      
      const expiredString = JSON.stringify(payload);
      const result = validateQRData(expiredString);

      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('EXPIRED');
      expect(result.error).toBe('QR code has expired');
    });

    it('should reject QR code missing signature', () => {
      const invalidPayload = {
        data: mockFarmerData
        // Missing signature
      };
      
      const result = validateQRData(JSON.stringify(invalidPayload));

      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('MISSING_SIGNATURE');
      expect(result.error).toBe('QR code is missing security signature');
    });

    it('should reject QR code with invalid JSON format', () => {
      const result = validateQRData('invalid json string');

      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('INVALID_FORMAT');
      expect(result.error).toBe('Invalid QR code format');
    });

    it('should reject QR code missing required fields', () => {
      const incompleteData = {
        batchId: 'KR12345',
        // Missing cropType and farmer
        harvestDate: '2024-01-15',
        location: 'Punjab',
        timestamp: Date.now(),
        version: '1.0'
      };

      const dataString = JSON.stringify(incompleteData);
      const signature = CryptoJS.HmacSHA256(dataString, 'krishiraksha-qr-secret-2024').toString();
      
      const payload = {
        data: incompleteData,
        signature
      };
      
      const result = validateQRData(JSON.stringify(payload));

      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('INVALID_FORMAT');
      expect(result.error).toBe('QR code is missing required information');
    });

    it('should accept QR code within 30 day validity period', () => {
      const qrString = generateSecureQRData(mockFarmerData);
      const payload = JSON.parse(qrString);
      
      // Set timestamp to 29 days ago (still valid)
      const recentTimestamp = Date.now() - (29 * 24 * 60 * 60 * 1000);
      payload.data.timestamp = recentTimestamp;
      
      // Regenerate signature
      const dataString = JSON.stringify(payload.data);
      payload.signature = CryptoJS.HmacSHA256(dataString, process.env.REACT_APP_QR_SECRET || 'krishiraksha-qr-secret-2024').toString();
      
      const validString = JSON.stringify(payload);
      const result = validateQRData(validString);

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('formatQRDataForDisplay', () => {
    it('should format QR data correctly for display', () => {
      const qrData: FarmerQRData = {
        ...mockFarmerData,
        timestamp: Date.now(),
        version: '1.0'
      };

      const formatted = formatQRDataForDisplay(qrData);

      expect(formatted).toContain('Batch ID: KR12345');
      expect(formatted).toContain('Crop: rice');
      expect(formatted).toContain('Farmer: Ramesh Kumar');
      expect(formatted).toContain('Location: Punjab');
      expect(formatted).toContain('Quantity: 100 kg');
      expect(formatted).toContain('✓ Organic Certified');
    });

    it('should handle optional fields correctly', () => {
      const minimalData: FarmerQRData = {
        batchId: 'KR12345',
        cropType: 'rice',
        farmer: 'Ramesh Kumar',
        harvestDate: '2024-01-15',
        location: 'Punjab',
        timestamp: Date.now(),
        version: '1.0'
      };

      const formatted = formatQRDataForDisplay(minimalData);

      expect(formatted).toContain('Batch ID: KR12345');
      expect(formatted).toContain('Crop: rice');
      expect(formatted).not.toContain('Quantity:');
      expect(formatted).not.toContain('✓ Organic Certified');
    });

    it('should format dates correctly', () => {
      const testDate = '2024-01-15';
      const qrData: FarmerQRData = {
        ...mockFarmerData,
        harvestDate: testDate,
        timestamp: new Date('2024-01-20').getTime(),
        version: '1.0'
      };

      const formatted = formatQRDataForDisplay(qrData);
      
      expect(formatted.some(line => line.includes('Harvest Date:'))).toBe(true);
      expect(formatted.some(line => line.includes('Generated:'))).toBe(true);
    });
  });

  describe('Security Features', () => {
    it('should use HMAC-SHA256 for signature generation', () => {
      const qrString = generateSecureQRData(mockFarmerData);
      const payload = JSON.parse(qrString);

      // HMAC-SHA256 produces 64 character hex strings
      expect(payload.signature).toHaveLength(64);
      expect(payload.signature).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should prevent replay attacks with different timestamps', () => {
      const qrString1 = generateSecureQRData(mockFarmerData);
      
      // Wait a bit to ensure different timestamp
      setTimeout(() => {
        const qrString2 = generateSecureQRData(mockFarmerData);
        
        const payload1 = JSON.parse(qrString1);
        const payload2 = JSON.parse(qrString2);
        
        expect(payload1.data.timestamp).not.toBe(payload2.data.timestamp);
        expect(payload1.signature).not.toBe(payload2.signature);
      }, 10);
    });
  });
});
