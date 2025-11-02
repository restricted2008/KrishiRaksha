# Form Validation Implementation Guide

## Overview

This project implements robust client-side form validation using **Yup** for schema validation, with comprehensive error handling, visual feedback, and full test coverage.

## Features

✅ **Schema-based validation** with Yup  
✅ **Real-time field-level validation**  
✅ **Summary error messages** for bulk validation failures  
✅ **Visual error indicators** (red borders, helper text, icons)  
✅ **Edge case coverage** (empty, wrong format, out of bounds)  
✅ **Accessibility** (ARIA attributes, screen reader support)  
✅ **Comprehensive test coverage** with Vitest  

## Architecture

### 1. Validation Schemas (`src/utils/validationSchemas.ts`)

Yup schemas define validation rules for each form:

```typescript
// Farmer Batch Schema
- cropType: Required, 2-50 chars, letters/spaces only
- variety: Optional, letters/numbers/hyphens
- quantity: Required, 0.1-1,000,000, max 2 decimals
- unit: Required, one of ['kg', 'quintal', 'ton', 'pieces']
- harvestDate: Required, past date, within 2 years
- expectedPrice: Optional, positive, max ₹100,000
- organicCertified: Boolean, required
- description: Optional, max 500 chars

// Supply Chain Shipment Schema
- batchId: Required, format "KR" + numbers
- destination: Required, 3-100 chars
- expectedDelivery: Required, future date, within 3 months
- vehicleId: Required, uppercase + numbers/hyphens
- driverName: Required, letters/spaces only
- driverPhone: Optional, 10-digit Indian mobile
- temperature: Optional, -50 to 100°C
- humidity: Optional, 0-100%, integer
```

### 2. Custom Hook (`src/hooks/useFormValidation.ts`)

Reusable validation hook with:
- `validate(data)` - Validate entire form
- `validateField(field, value)` - Validate single field
- `clearError(field)` - Clear specific error
- `clearAllErrors()` - Clear all errors
- `setError(field, message)` - Set manual error

### 3. Error Display Components (`src/components/FormError.tsx`)

#### FieldError
Displays inline error for a single field with icon

#### SummaryError
Shows all errors in a summary box at top of form

#### InputWrapper
Wraps inputs with label, error display, and visual feedback

## Usage

### Basic Form Component

```typescript
import { useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { farmerBatchSchema, FarmerBatchFormData } from '../utils/validationSchemas';
import { SummaryError, InputWrapper } from '../components/FormError';

export const MyForm = () => {
  const [formData, setFormData] = useState<Partial<FarmerBatchFormData>>({});
  const [showSummaryError, setShowSummaryError] = useState(false);
  
  const { errors, validate, validateField } = useFormValidation<FarmerBatchFormData>(
    farmerBatchSchema
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validate(formData as FarmerBatchFormData);
    
    if (isValid) {
      // Submit form
    } else {
      setShowSummaryError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {showSummaryError && <SummaryError errors={errors} />}
      
      <InputWrapper label="Crop Type" error={errors.cropType} required>
        <Input
          value={formData.cropType || ''}
          onChange={(e) => {
            setFormData({ ...formData, cropType: e.target.value });
            validateField('cropType', e.target.value);
          }}
          className={errors.cropType ? 'border-red-500' : ''}
        />
      </InputWrapper>
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Pre-built Form Components

Two ready-to-use validated form components are provided:

### FarmerBatchForm
```typescript
import { FarmerBatchForm } from '../components/FarmerBatchForm';

<FarmerBatchForm
  onSubmit={(data) => console.log(data)}
  onCancel={() => console.log('Cancelled')}
  initialData={{ cropType: 'Tomato' }}
/>
```

### ShipmentForm
```typescript
import { ShipmentForm } from '../components/ShipmentForm';

<ShipmentForm
  onSubmit={(data) => console.log(data)}
  onCancel={() => console.log('Cancelled')}
/>
```

## Visual Feedback

### Invalid Fields
- **Red border** (`border-red-500`)
- **Red label text**
- **Error icon** with message below field
- **Red ring** on focus (`ring-red-500`)

### Valid Feedback
- Standard border styling
- No error messages
- Form submits successfully

### Summary Error Box
- **Red background** with border
- **List of all errors** with field names
- **Dismissible** with X button
- **Auto-scroll** to top on validation failure

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Test Coverage

#### Validation Schemas (`validationSchemas.test.ts`)
- ✅ 50+ test cases covering all validation rules
- ✅ Empty/missing values
- ✅ Wrong formats (numbers in text, invalid patterns)
- ✅ Out of bounds (min/max values, dates)
- ✅ Edge cases (decimal places, character limits)

#### Form Components (`FarmerBatchForm.test.tsx`)
- ✅ Render all form fields
- ✅ Show validation errors on submit
- ✅ Field-level error display
- ✅ Summary error display
- ✅ Clear errors when user corrects
- ✅ Submit with valid data
- ✅ Cancel functionality
- ✅ Character count tracking

## Edge Cases Covered

### Empty Values
- Required fields show "X is required"
- Optional fields pass validation

### Wrong Format
- Crop type with numbers: "can only contain letters and spaces"
- Invalid batch ID format: "must start with KR followed by numbers"
- Invalid phone: "must be a valid 10-digit Indian mobile number"

### Out of Bounds
- Quantity too small: "must be at least 0.1"
- Quantity too large: "cannot exceed 1,000,000"
- Future harvest date: "cannot be in the future"
- Past delivery date: "must be in the future"
- Temperature out of range: "must be at least -50°C"
- Humidity over 100: "cannot exceed 100%"

### Format Precision
- Quantity decimal places: "can have at most 2 decimal places"
- Temperature decimal: "can have at most 1 decimal place"
- Humidity must be integer: "must be a whole number"

### Length Limits
- Crop type too short: "must be at least 2 characters"
- Description too long: "must not exceed 500 characters"
- Vehicle ID too short: "must be at least 4 characters"

## Accessibility

All forms include:
- **Semantic HTML** (labels, fieldsets)
- **ARIA attributes** (`aria-invalid`, `aria-describedby`)
- **Keyboard navigation** (tab order, enter to submit)
- **Screen reader support** (error announcements)
- **Focus management** (auto-scroll to errors)

## Best Practices

1. **Validate on blur** for better UX (not every keystroke)
2. **Show summary errors** on submit attempt
3. **Clear errors** as user fixes them
4. **Use visual feedback** (colors, icons, borders)
5. **Provide helpful error messages** (specific, actionable)
6. **Test edge cases** comprehensively
7. **Make optional fields clear** (no required asterisk)
8. **Add character counters** for length-limited fields

## Integration with Existing Forms

To add validation to existing forms:

1. Import the validation schema
2. Use the `useFormValidation` hook
3. Add error display components
4. Update input styles based on errors
5. Prevent submission if invalid

See `FarmerBatchForm.tsx` and `ShipmentForm.tsx` for complete examples.

## Performance

- **Async validation** doesn't block UI
- **Debounced field validation** (on blur, not every keystroke)
- **Efficient error state management** (only re-render on changes)
- **Lazy schema compilation** by Yup

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ required
- Works with React 18+
- Compatible with Vite build system

## Future Enhancements

- [ ] Server-side validation integration
- [ ] Custom validation rules
- [ ] Async validation (API calls)
- [ ] Multi-step form validation
- [ ] Conditional validation based on field values
- [ ] Form state persistence (localStorage)

## Troubleshooting

### Tests failing?
```bash
# Reinstall dependencies
npm install

# Clear cache
npm test -- --clearCache
```

### Type errors?
Ensure TypeScript is properly configured in `tsconfig.json`

### Validation not working?
Check that:
1. Schema is imported correctly
2. Hook is called with correct schema
3. Form data matches schema shape
4. Errors are being displayed in UI

## Resources

- [Yup Documentation](https://github.com/jquense/yup)
- [React Testing Library](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
