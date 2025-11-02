import { describe, it, expect } from 'vitest';
import { farmerBatchSchema, supplyChainShipmentSchema } from '../utils/validationSchemas';

describe('farmerBatchSchema', () => {
  describe('cropType validation', () => {
    it('should pass with valid crop type', async () => {
      const validData = {
        cropType: 'Tomato',
        variety: '',
        quantity: 100,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail when cropType is empty', async () => {
      const invalidData = {
        cropType: '',
        quantity: 100,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Crop type is required'
      );
    });

    it('should fail when cropType is too short', async () => {
      const invalidData = {
        cropType: 'A',
        quantity: 100,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Crop type must be at least 2 characters'
      );
    });

    it('should fail when cropType is too long', async () => {
      const invalidData = {
        cropType: 'A'.repeat(51),
        quantity: 100,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Crop type must not exceed 50 characters'
      );
    });

    it('should fail when cropType contains numbers', async () => {
      const invalidData = {
        cropType: 'Tomato123',
        quantity: 100,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Crop type can only contain letters and spaces'
      );
    });
  });

  describe('quantity validation', () => {
    it('should pass with valid quantity', async () => {
      const validData = {
        cropType: 'Wheat',
        quantity: 250.5,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail when quantity is missing', async () => {
      const invalidData = {
        cropType: 'Wheat',
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Quantity is required'
      );
    });

    it('should fail when quantity is zero', async () => {
      const invalidData = {
        cropType: 'Wheat',
        quantity: 0,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Quantity must be a positive number'
      );
    });

    it('should fail when quantity is negative', async () => {
      const invalidData = {
        cropType: 'Wheat',
        quantity: -10,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Quantity must be a positive number'
      );
    });

    it('should fail when quantity is below minimum', async () => {
      const invalidData = {
        cropType: 'Wheat',
        quantity: 0.05,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Quantity must be at least 0.1'
      );
    });

    it('should fail when quantity exceeds maximum', async () => {
      const invalidData = {
        cropType: 'Wheat',
        quantity: 1000001,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Quantity cannot exceed 1,000,000'
      );
    });

    it('should fail when quantity has more than 2 decimal places', async () => {
      const invalidData = {
        cropType: 'Wheat',
        quantity: 10.123,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Quantity can have at most 2 decimal places'
      );
    });
  });

  describe('unit validation', () => {
    it('should pass with valid units', async () => {
      const units = ['kg', 'quintal', 'ton', 'pieces'];
      
      for (const unit of units) {
        const validData = {
          cropType: 'Rice',
          quantity: 100,
          unit,
          harvestDate: new Date(),
          organicCertified: false,
        };
        await expect(farmerBatchSchema.validate(validData)).resolves.toBeTruthy();
      }
    });

    it('should fail with invalid unit', async () => {
      const invalidData = {
        cropType: 'Rice',
        quantity: 100,
        unit: 'pounds',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Invalid unit selected'
      );
    });
  });

  describe('harvestDate validation', () => {
    it('should pass with valid past date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      
      const validData = {
        cropType: 'Corn',
        quantity: 500,
        unit: 'kg',
        harvestDate: pastDate,
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail with future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      const invalidData = {
        cropType: 'Corn',
        quantity: 500,
        unit: 'kg',
        harvestDate: futureDate,
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Harvest date cannot be in the future'
      );
    });

    it('should fail with date more than 2 years ago', async () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 3);
      
      const invalidData = {
        cropType: 'Corn',
        quantity: 500,
        unit: 'kg',
        harvestDate: oldDate,
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Harvest date cannot be more than 2 years ago'
      );
    });

    it('should fail with invalid date format', async () => {
      const invalidData = {
        cropType: 'Corn',
        quantity: 500,
        unit: 'kg',
        harvestDate: 'invalid-date',
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Invalid date format'
      );
    });
  });

  describe('expectedPrice validation', () => {
    it('should pass with valid price', async () => {
      const validData = {
        cropType: 'Potato',
        quantity: 200,
        unit: 'kg',
        harvestDate: new Date(),
        expectedPrice: 25.50,
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should pass when expectedPrice is empty (optional)', async () => {
      const validData = {
        cropType: 'Potato',
        quantity: 200,
        unit: 'kg',
        harvestDate: new Date(),
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail when expectedPrice is negative', async () => {
      const invalidData = {
        cropType: 'Potato',
        quantity: 200,
        unit: 'kg',
        harvestDate: new Date(),
        expectedPrice: -10,
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Expected price must be a positive number'
      );
    });

    it('should fail when expectedPrice exceeds maximum', async () => {
      const invalidData = {
        cropType: 'Potato',
        quantity: 200,
        unit: 'kg',
        harvestDate: new Date(),
        expectedPrice: 100001,
        organicCertified: false,
      };
      await expect(farmerBatchSchema.validate(invalidData)).rejects.toThrow(
        'Expected price cannot exceed ₹100,000 per unit'
      );
    });
  });
});

describe('supplyChainShipmentSchema', () => {
  describe('batchId validation', () => {
    it('should pass with valid batchId', async () => {
      const validData = {
        batchId: 'KR123456',
        destination: 'Delhi Market',
        expectedDelivery: new Date(Date.now() + 86400000), // tomorrow
        vehicleId: 'TRK-001',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail when batchId is empty', async () => {
      const invalidData = {
        batchId: '',
        destination: 'Delhi Market',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-001',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Batch ID is required'
      );
    });

    it('should fail when batchId has wrong format', async () => {
      const invalidData = {
        batchId: 'ABC123',
        destination: 'Delhi Market',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-001',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Batch ID must start with "KR" followed by numbers'
      );
    });
  });

  describe('destination validation', () => {
    it('should pass with valid destination', async () => {
      const validData = {
        batchId: 'KR123456',
        destination: 'Mumbai Port, Gate 5',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-001',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail when destination is too short', async () => {
      const invalidData = {
        batchId: 'KR123456',
        destination: 'AB',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-001',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Destination must be at least 3 characters'
      );
    });

    it('should fail when destination contains invalid characters', async () => {
      const invalidData = {
        batchId: 'KR123456',
        destination: 'Mumbai @ Port #5',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-001',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Destination contains invalid characters'
      );
    });
  });

  describe('expectedDelivery validation', () => {
    it('should pass with future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const validData = {
        batchId: 'KR123456',
        destination: 'Delhi',
        expectedDelivery: futureDate,
        vehicleId: 'TRK-001',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail with past date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const invalidData = {
        batchId: 'KR123456',
        destination: 'Delhi',
        expectedDelivery: pastDate,
        vehicleId: 'TRK-001',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Expected delivery date must be in the future'
      );
    });

    it('should fail with date more than 3 months ahead', async () => {
      const farFutureDate = new Date();
      farFutureDate.setMonth(farFutureDate.getMonth() + 4);
      
      const invalidData = {
        batchId: 'KR123456',
        destination: 'Delhi',
        expectedDelivery: farFutureDate,
        vehicleId: 'TRK-001',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Expected delivery date cannot be more than 3 months from now'
      );
    });
  });

  describe('vehicleId validation', () => {
    it('should pass with valid vehicleId', async () => {
      const validData = {
        batchId: 'KR123456',
        destination: 'Chennai',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-123',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail when vehicleId contains lowercase letters', async () => {
      const invalidData = {
        batchId: 'KR123456',
        destination: 'Chennai',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'trk-123',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Vehicle ID must contain only uppercase letters, numbers and hyphens'
      );
    });

    it('should fail when vehicleId is too short', async () => {
      const invalidData = {
        batchId: 'KR123456',
        destination: 'Chennai',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK',
        driverName: 'John Doe',
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Vehicle ID must be at least 4 characters'
      );
    });
  });

  describe('driverName validation', () => {
    it('should pass with valid name', async () => {
      const validData = {
        batchId: 'KR123456',
        destination: 'Bangalore',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-456',
        driverName: 'Ram Kumar',
      };
      await expect(supplyChainShipmentSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail when driverName contains numbers', async () => {
      const invalidData = {
        batchId: 'KR123456',
        destination: 'Bangalore',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-456',
        driverName: 'John123',
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Driver name can only contain letters and spaces'
      );
    });
  });

  describe('optional fields validation', () => {
    it('should pass with valid temperature', async () => {
      const validData = {
        batchId: 'KR123456',
        destination: 'Pune',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-789',
        driverName: 'Suresh Patel',
        temperature: 15.5,
      };
      await expect(supplyChainShipmentSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail when temperature is below minimum', async () => {
      const invalidData = {
        batchId: 'KR123456',
        destination: 'Pune',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-789',
        driverName: 'Suresh Patel',
        temperature: -51,
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Temperature must be at least -50°C'
      );
    });

    it('should pass with valid humidity', async () => {
      const validData = {
        batchId: 'KR123456',
        destination: 'Hyderabad',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-999',
        driverName: 'Amit Shah',
        humidity: 65,
      };
      await expect(supplyChainShipmentSchema.validate(validData)).resolves.toBeTruthy();
    });

    it('should fail when humidity exceeds maximum', async () => {
      const invalidData = {
        batchId: 'KR123456',
        destination: 'Hyderabad',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-999',
        driverName: 'Amit Shah',
        humidity: 101,
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Humidity cannot exceed 100%'
      );
    });

    it('should fail when humidity is not an integer', async () => {
      const invalidData = {
        batchId: 'KR123456',
        destination: 'Hyderabad',
        expectedDelivery: new Date(Date.now() + 86400000),
        vehicleId: 'TRK-999',
        driverName: 'Amit Shah',
        humidity: 65.5,
      };
      await expect(supplyChainShipmentSchema.validate(invalidData)).rejects.toThrow(
        'Humidity must be a whole number'
      );
    });
  });
});
