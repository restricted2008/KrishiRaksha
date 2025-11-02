import * as yup from 'yup';

/**
 * Validation schema for Farmer Registration/Batch Creation Form
 */
export const farmerBatchSchema = yup.object().shape({
  cropType: yup
    .string()
    .required('Crop type is required')
    .min(2, 'Crop type must be at least 2 characters')
    .max(50, 'Crop type must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Crop type can only contain letters and spaces'),

  variety: yup
    .string()
    .max(50, 'Variety must not exceed 50 characters')
    .matches(/^[a-zA-Z0-9\s-]*$/, 'Variety can only contain letters, numbers, spaces and hyphens'),

  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be a positive number')
    .min(0.1, 'Quantity must be at least 0.1')
    .max(1000000, 'Quantity cannot exceed 1,000,000')
    .test('decimal-places', 'Quantity can have at most 2 decimal places', (value) => {
      if (value === undefined) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    }),

  unit: yup
    .string()
    .required('Unit is required')
    .oneOf(['kg', 'quintal', 'ton', 'pieces'], 'Invalid unit selected'),

  harvestDate: yup
    .date()
    .required('Harvest date is required')
    .max(new Date(), 'Harvest date cannot be in the future')
    .min(
      new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
      'Harvest date cannot be more than 2 years ago'
    )
    .typeError('Invalid date format'),

  expectedPrice: yup
    .number()
    .transform((value, originalValue) => {
      // Handle empty string
      return originalValue === '' ? undefined : value;
    })
    .positive('Expected price must be a positive number')
    .min(0.01, 'Expected price must be at least ₹0.01')
    .max(100000, 'Expected price cannot exceed ₹100,000 per unit')
    .test('decimal-places', 'Price can have at most 2 decimal places', (value) => {
      if (value === undefined) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    })
    .nullable()
    .optional(),

  organicCertified: yup
    .boolean()
    .required('Organic certification status is required'),

  description: yup
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .nullable()
    .optional(),
});

/**
 * Validation schema for Supply Chain Update/Shipment Form
 */
export const supplyChainShipmentSchema = yup.object().shape({
  batchId: yup
    .string()
    .required('Batch ID is required')
    .matches(/^KR\d+$/, 'Batch ID must start with "KR" followed by numbers (e.g., KR123456)')
    .min(5, 'Batch ID must be at least 5 characters')
    .max(20, 'Batch ID must not exceed 20 characters'),

  destination: yup
    .string()
    .required('Destination is required')
    .min(3, 'Destination must be at least 3 characters')
    .max(100, 'Destination must not exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s,.-]+$/, 'Destination contains invalid characters'),

  currentLocation: yup
    .string()
    .max(100, 'Current location must not exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s,.-]*$/, 'Location contains invalid characters')
    .nullable()
    .optional(),

  expectedDelivery: yup
    .date()
    .required('Expected delivery date is required')
    .min(new Date(), 'Expected delivery date must be in the future')
    .max(
      new Date(new Date().setMonth(new Date().getMonth() + 3)),
      'Expected delivery date cannot be more than 3 months from now'
    )
    .typeError('Invalid date format'),

  vehicleId: yup
    .string()
    .required('Vehicle ID is required')
    .matches(/^[A-Z0-9-]+$/, 'Vehicle ID must contain only uppercase letters, numbers and hyphens')
    .min(4, 'Vehicle ID must be at least 4 characters')
    .max(20, 'Vehicle ID must not exceed 20 characters'),

  driverName: yup
    .string()
    .required('Driver name is required')
    .min(2, 'Driver name must be at least 2 characters')
    .max(50, 'Driver name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Driver name can only contain letters and spaces'),

  driverPhone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, 'Driver phone must be a valid 10-digit Indian mobile number')
    .nullable()
    .optional(),

  temperature: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    })
    .min(-50, 'Temperature must be at least -50°C')
    .max(100, 'Temperature cannot exceed 100°C')
    .test('decimal-places', 'Temperature can have at most 1 decimal place', (value) => {
      if (value === undefined) return true;
      return /^-?\d+(\.\d)?$/.test(value.toString());
    })
    .nullable()
    .optional(),

  humidity: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    })
    .min(0, 'Humidity must be at least 0%')
    .max(100, 'Humidity cannot exceed 100%')
    .integer('Humidity must be a whole number')
    .nullable()
    .optional(),

  status: yup
    .string()
    .oneOf(
      ['Picked Up', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'],
      'Invalid status selected'
    )
    .nullable()
    .optional(),

  notes: yup
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .nullable()
    .optional(),
});

/**
 * Type definitions for form data
 */
export type FarmerBatchFormData = yup.InferType<typeof farmerBatchSchema>;
export type SupplyChainShipmentFormData = yup.InferType<typeof supplyChainShipmentSchema>;
