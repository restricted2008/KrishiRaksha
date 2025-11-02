import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FieldError, SummaryError, InputWrapper } from './FormError';
import { useFormValidation } from '../hooks/useFormValidation';
import { farmerBatchSchema, FarmerBatchFormData } from '../utils/validationSchemas';
import { AlertCircle } from 'lucide-react';

interface FarmerBatchFormProps {
  onSubmit: (data: FarmerBatchFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<FarmerBatchFormData>;
}

export const FarmerBatchForm: React.FC<FarmerBatchFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<FarmerBatchFormData>>({
    cropType: initialData?.cropType || '',
    variety: initialData?.variety || '',
    quantity: initialData?.quantity || undefined,
    unit: initialData?.unit || 'kg',
    harvestDate: initialData?.harvestDate || undefined,
    expectedPrice: initialData?.expectedPrice || undefined,
    organicCertified: initialData?.organicCertified || false,
    description: initialData?.description || '',
  });

  const [showSummaryError, setShowSummaryError] = useState(false);
  const { errors, validate, validateField, clearAllErrors } = useFormValidation<FarmerBatchFormData>(
    farmerBatchSchema
  );

  const handleInputChange = async (field: keyof FarmerBatchFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear summary error when user starts fixing issues
    if (showSummaryError) {
      setShowSummaryError(false);
    }

    // Validate field on blur
    if (value !== '' && value !== undefined) {
      await validateField(field, value);
    }
  };

  const handleBlur = async (field: keyof FarmerBatchFormData) => {
    const value = formData[field];
    if (value !== '' && value !== undefined) {
      await validateField(field, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validate(formData as FarmerBatchFormData);
    
    if (isValid) {
      clearAllErrors();
      setShowSummaryError(false);
      onSubmit(formData as FarmerBatchFormData);
    } else {
      setShowSummaryError(true);
      // Scroll to top to show summary error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    clearAllErrors();
    setShowSummaryError(false);
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Summary Error */}
      {showSummaryError && Object.keys(errors).length > 0 && (
        <SummaryError
          errors={errors}
          title="Please fix the following errors before submitting:"
          onDismiss={() => setShowSummaryError(false)}
        />
      )}

      {/* Crop Type */}
      <InputWrapper
        label="Crop Type"
        error={errors.cropType}
        required
        htmlFor="cropType"
      >
        <Input
          id="cropType"
          value={formData.cropType || ''}
          onChange={(e) => handleInputChange('cropType', e.target.value)}
          onBlur={() => handleBlur('cropType')}
          placeholder="e.g., Tomato, Wheat, Rice"
          className={errors.cropType ? 'border-red-500 focus:ring-red-500' : ''}
          aria-invalid={!!errors.cropType}
          aria-describedby={errors.cropType ? 'cropType-error' : undefined}
        />
      </InputWrapper>

      {/* Variety */}
      <InputWrapper
        label="Variety"
        error={errors.variety}
        htmlFor="variety"
      >
        <Input
          id="variety"
          value={formData.variety || ''}
          onChange={(e) => handleInputChange('variety', e.target.value)}
          onBlur={() => handleBlur('variety')}
          placeholder="e.g., Hybrid, Organic"
          className={errors.variety ? 'border-red-500 focus:ring-red-500' : ''}
        />
      </InputWrapper>

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <InputWrapper
          label="Quantity"
          error={errors.quantity}
          required
          htmlFor="quantity"
        >
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0.1"
            value={formData.quantity || ''}
            onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value))}
            onBlur={() => handleBlur('quantity')}
            placeholder="e.g., 100"
            className={errors.quantity ? 'border-red-500 focus:ring-red-500' : ''}
            aria-invalid={!!errors.quantity}
          />
        </InputWrapper>

        <InputWrapper
          label="Unit"
          error={errors.unit}
          required
          htmlFor="unit"
        >
          <Select
            value={formData.unit || 'kg'}
            onValueChange={(value) => handleInputChange('unit', value)}
          >
            <SelectTrigger
              id="unit"
              className={errors.unit ? 'border-red-500 focus:ring-red-500' : ''}
            >
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="quintal">Quintal</SelectItem>
              <SelectItem value="ton">Ton</SelectItem>
              <SelectItem value="pieces">Pieces</SelectItem>
            </SelectContent>
          </Select>
        </InputWrapper>
      </div>

      {/* Harvest Date */}
      <InputWrapper
        label="Harvest Date"
        error={errors.harvestDate}
        required
        htmlFor="harvestDate"
      >
        <Input
          id="harvestDate"
          type="date"
          value={
            formData.harvestDate
              ? new Date(formData.harvestDate).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) => handleInputChange('harvestDate', new Date(e.target.value))}
          onBlur={() => handleBlur('harvestDate')}
          max={new Date().toISOString().split('T')[0]}
          className={errors.harvestDate ? 'border-red-500 focus:ring-red-500' : ''}
          aria-invalid={!!errors.harvestDate}
        />
      </InputWrapper>

      {/* Expected Price */}
      <InputWrapper
        label="Expected Price per Unit (₹)"
        error={errors.expectedPrice}
        htmlFor="expectedPrice"
      >
        <Input
          id="expectedPrice"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.expectedPrice || ''}
          onChange={(e) => handleInputChange('expectedPrice', parseFloat(e.target.value))}
          onBlur={() => handleBlur('expectedPrice')}
          placeholder="e.g., 25.50"
          className={errors.expectedPrice ? 'border-red-500 focus:ring-red-500' : ''}
        />
      </InputWrapper>

      {/* Organic Certified */}
      <div className="flex items-center space-x-2">
        <input
          id="organicCertified"
          type="checkbox"
          checked={formData.organicCertified || false}
          onChange={(e) => handleInputChange('organicCertified', e.target.checked)}
          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <Label htmlFor="organicCertified" className="text-sm font-medium text-gray-700">
          Organic Certified
        </Label>
      </div>

      {/* Description */}
      <InputWrapper
        label="Description"
        error={errors.description}
        htmlFor="description"
      >
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          placeholder="Additional information about the batch..."
          rows={3}
          maxLength={500}
          className={errors.description ? 'border-red-500 focus:ring-red-500' : ''}
        />
        <p className="text-xs text-gray-500 mt-1">
          {(formData.description?.length || 0)}/500 characters
        </p>
      </InputWrapper>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          Submit Batch
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
          <p>
            All fields marked with <span className="text-red-500">*</span> are required.
            Form data is validated in real-time as you type.
          </p>
        </div>
      </div>
    </form>
  );
};
