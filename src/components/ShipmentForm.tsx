import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { FieldError, SummaryError, InputWrapper } from './FormError';
import { useFormValidation } from '../hooks/useFormValidation';
import { supplyChainShipmentSchema, SupplyChainShipmentFormData } from '../utils/validationSchemas';
import { AlertCircle } from 'lucide-react';

interface ShipmentFormProps {
  onSubmit: (data: SupplyChainShipmentFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<SupplyChainShipmentFormData>;
}

export const ShipmentForm: React.FC<ShipmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<SupplyChainShipmentFormData>>({
    batchId: initialData?.batchId || '',
    destination: initialData?.destination || '',
    currentLocation: initialData?.currentLocation || '',
    expectedDelivery: initialData?.expectedDelivery || undefined,
    vehicleId: initialData?.vehicleId || '',
    driverName: initialData?.driverName || '',
    driverPhone: initialData?.driverPhone || '',
    temperature: initialData?.temperature || undefined,
    humidity: initialData?.humidity || undefined,
    notes: initialData?.notes || '',
  });

  const [showSummaryError, setShowSummaryError] = useState(false);
  const { errors, validate, validateField, clearAllErrors } = useFormValidation<SupplyChainShipmentFormData>(
    supplyChainShipmentSchema
  );

  const handleInputChange = async (field: keyof SupplyChainShipmentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (showSummaryError) {
      setShowSummaryError(false);
    }

    // Validate on change for better UX
    if (value !== '' && value !== undefined) {
      await validateField(field, value);
    }
  };

  const handleBlur = async (field: keyof SupplyChainShipmentFormData) => {
    const value = formData[field];
    if (value !== '' && value !== undefined) {
      await validateField(field, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validate(formData as SupplyChainShipmentFormData);
    
    if (isValid) {
      clearAllErrors();
      setShowSummaryError(false);
      onSubmit(formData as SupplyChainShipmentFormData);
    } else {
      setShowSummaryError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    clearAllErrors();
    setShowSummaryError(false);
    if (onCancel) onCancel();
  };

  // Get tomorrow's date as minimum for expected delivery
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDeliveryDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Summary Error */}
      {showSummaryError && Object.keys(errors).length > 0 && (
        <SummaryError
          errors={errors}
          title="Please correct the following errors:"
          onDismiss={() => setShowSummaryError(false)}
        />
      )}

      {/* Batch ID */}
      <InputWrapper
        label="Batch ID"
        error={errors.batchId}
        required
        htmlFor="batchId"
      >
        <Input
          id="batchId"
          value={formData.batchId || ''}
          onChange={(e) => handleInputChange('batchId', e.target.value.toUpperCase())}
          onBlur={() => handleBlur('batchId')}
          placeholder="e.g., KR123456"
          className={errors.batchId ? 'border-red-500 focus:ring-red-500' : ''}
          aria-invalid={!!errors.batchId}
        />
      </InputWrapper>

      {/* Destination */}
      <InputWrapper
        label="Destination"
        error={errors.destination}
        required
        htmlFor="destination"
      >
        <Input
          id="destination"
          value={formData.destination || ''}
          onChange={(e) => handleInputChange('destination', e.target.value)}
          onBlur={() => handleBlur('destination')}
          placeholder="e.g., Delhi Market, Gate 5"
          className={errors.destination ? 'border-red-500 focus:ring-red-500' : ''}
          aria-invalid={!!errors.destination}
        />
      </InputWrapper>

      {/* Current Location */}
      <InputWrapper
        label="Current Location"
        error={errors.currentLocation}
        htmlFor="currentLocation"
      >
        <Input
          id="currentLocation"
          value={formData.currentLocation || ''}
          onChange={(e) => handleInputChange('currentLocation', e.target.value)}
          onBlur={() => handleBlur('currentLocation')}
          placeholder="e.g., Highway NH-1, Km 45"
          className={errors.currentLocation ? 'border-red-500 focus:ring-red-500' : ''}
        />
      </InputWrapper>

      {/* Expected Delivery Date */}
      <InputWrapper
        label="Expected Delivery Date"
        error={errors.expectedDelivery}
        required
        htmlFor="expectedDelivery"
      >
        <Input
          id="expectedDelivery"
          type="date"
          value={
            formData.expectedDelivery
              ? new Date(formData.expectedDelivery).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) => handleInputChange('expectedDelivery', new Date(e.target.value))}
          onBlur={() => handleBlur('expectedDelivery')}
          min={minDeliveryDate}
          className={errors.expectedDelivery ? 'border-red-500 focus:ring-red-500' : ''}
          aria-invalid={!!errors.expectedDelivery}
        />
      </InputWrapper>

      {/* Vehicle ID */}
      <InputWrapper
        label="Vehicle ID"
        error={errors.vehicleId}
        required
        htmlFor="vehicleId"
      >
        <Input
          id="vehicleId"
          value={formData.vehicleId || ''}
          onChange={(e) => handleInputChange('vehicleId', e.target.value.toUpperCase())}
          onBlur={() => handleBlur('vehicleId')}
          placeholder="e.g., TRK-123"
          className={errors.vehicleId ? 'border-red-500 focus:ring-red-500' : ''}
          aria-invalid={!!errors.vehicleId}
        />
      </InputWrapper>

      {/* Driver Name */}
      <InputWrapper
        label="Driver Name"
        error={errors.driverName}
        required
        htmlFor="driverName"
      >
        <Input
          id="driverName"
          value={formData.driverName || ''}
          onChange={(e) => handleInputChange('driverName', e.target.value)}
          onBlur={() => handleBlur('driverName')}
          placeholder="e.g., Ram Kumar"
          className={errors.driverName ? 'border-red-500 focus:ring-red-500' : ''}
          aria-invalid={!!errors.driverName}
        />
      </InputWrapper>

      {/* Driver Phone */}
      <InputWrapper
        label="Driver Phone"
        error={errors.driverPhone}
        htmlFor="driverPhone"
      >
        <Input
          id="driverPhone"
          type="tel"
          value={formData.driverPhone || ''}
          onChange={(e) => handleInputChange('driverPhone', e.target.value)}
          onBlur={() => handleBlur('driverPhone')}
          placeholder="e.g., 9876543210"
          maxLength={10}
          className={errors.driverPhone ? 'border-red-500 focus:ring-red-500' : ''}
        />
      </InputWrapper>

      {/* Temperature and Humidity */}
      <div className="grid grid-cols-2 gap-4">
        <InputWrapper
          label="Temperature (°C)"
          error={errors.temperature}
          htmlFor="temperature"
        >
          <Input
            id="temperature"
            type="number"
            step="0.1"
            min="-50"
            max="100"
            value={formData.temperature || ''}
            onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
            onBlur={() => handleBlur('temperature')}
            placeholder="e.g., 15.5"
            className={errors.temperature ? 'border-red-500 focus:ring-red-500' : ''}
          />
        </InputWrapper>

        <InputWrapper
          label="Humidity (%)"
          error={errors.humidity}
          htmlFor="humidity"
        >
          <Input
            id="humidity"
            type="number"
            min="0"
            max="100"
            value={formData.humidity || ''}
            onChange={(e) => handleInputChange('humidity', parseInt(e.target.value))}
            onBlur={() => handleBlur('humidity')}
            placeholder="e.g., 65"
            className={errors.humidity ? 'border-red-500 focus:ring-red-500' : ''}
          />
        </InputWrapper>
      </div>

      {/* Notes */}
      <InputWrapper
        label="Notes"
        error={errors.notes}
        htmlFor="notes"
      >
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          onBlur={() => handleBlur('notes')}
          placeholder="Additional notes or special instructions..."
          rows={3}
          maxLength={500}
          className={errors.notes ? 'border-red-500 focus:ring-red-500' : ''}
        />
        <p className="text-xs text-gray-500 mt-1">
          {(formData.notes?.length || 0)}/500 characters
        </p>
      </InputWrapper>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          Create Shipment
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Validation Rules:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Batch ID must start with "KR" followed by numbers</li>
              <li>Vehicle ID must be uppercase letters, numbers, and hyphens</li>
              <li>Expected delivery must be within 3 months</li>
              <li>Driver phone must be a valid 10-digit Indian number</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
};
