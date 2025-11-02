import { createRegistrationSlice, RegistrationSlice } from '../registrationSlice';

describe('registrationSlice', () => {
  let slice: RegistrationSlice;
  const mockSet = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    slice = createRegistrationSlice(mockSet as any, mockGet as any, {} as any);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(slice.currentStep).toBe(1);
      expect(slice.registrationData).toEqual({});
      expect(slice.errors).toEqual({});
      expect(slice.isComplete).toBe(false);
    });
  });

  describe('setCurrentStep', () => {
    it('should update current step', () => {
      mockGet.mockReturnValue({ currentStep: 1 });

      slice.setCurrentStep(2);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 2,
        })
      );
    });

    it('should not allow step less than 1', () => {
      mockGet.mockReturnValue({ currentStep: 1 });

      slice.setCurrentStep(0);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 1,
        })
      );
    });

    it('should not allow step greater than total steps', () => {
      mockGet.mockReturnValue({ currentStep: 1, totalSteps: 4 });

      slice.setCurrentStep(5);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 4,
        })
      );
    });
  });

  describe('nextStep', () => {
    it('should move to next step', () => {
      mockGet.mockReturnValue({ currentStep: 1, totalSteps: 4 });

      slice.nextStep();

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 2,
        })
      );
    });

    it('should not exceed total steps', () => {
      mockGet.mockReturnValue({ currentStep: 4, totalSteps: 4 });

      slice.nextStep();

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 4,
        })
      );
    });
  });

  describe('previousStep', () => {
    it('should move to previous step', () => {
      mockGet.mockReturnValue({ currentStep: 3, totalSteps: 4 });

      slice.previousStep();

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 2,
        })
      );
    });

    it('should not go below step 1', () => {
      mockGet.mockReturnValue({ currentStep: 1, totalSteps: 4 });

      slice.previousStep();

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 1,
        })
      );
    });
  });

  describe('updateRegistrationData', () => {
    it('should merge new data with existing data', () => {
      const existingData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockGet.mockReturnValue({ registrationData: existingData });

      const newData = {
        phone: '+91 12345 67890',
        location: 'Test Location',
      };

      slice.updateRegistrationData(newData);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationData: {
            ...existingData,
            ...newData,
          },
        })
      );
    });

    it('should overwrite existing fields', () => {
      const existingData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockGet.mockReturnValue({ registrationData: existingData });

      const newData = {
        name: 'Jane Doe',
      };

      slice.updateRegistrationData(newData);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationData: {
            ...existingData,
            name: 'Jane Doe',
          },
        })
      );
    });
  });

  describe('setErrors', () => {
    it('should set validation errors', () => {
      mockGet.mockReturnValue({ errors: {} });

      const errors = {
        email: 'Invalid email format',
        password: 'Password too short',
      };

      slice.setErrors(errors);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          errors,
        })
      );
    });

    it('should replace existing errors', () => {
      mockGet.mockReturnValue({ 
        errors: { 
          email: 'Old error' 
        } 
      });

      const errors = {
        password: 'New error',
      };

      slice.setErrors(errors);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          errors,
        })
      );
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      mockGet.mockReturnValue({ 
        errors: { 
          email: 'Error 1',
          password: 'Error 2',
        } 
      });

      slice.clearErrors();

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: {},
        })
      );
    });
  });

  describe('completeRegistration', () => {
    it('should mark registration as complete', () => {
      mockGet.mockReturnValue({ isComplete: false });

      slice.completeRegistration();

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          isComplete: true,
        })
      );
    });
  });

  describe('resetRegistration', () => {
    it('should reset all registration state', () => {
      mockGet.mockReturnValue({
        currentStep: 3,
        registrationData: { name: 'Test', email: 'test@example.com' },
        errors: { email: 'Some error' },
        isComplete: true,
      });

      slice.resetRegistration();

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 1,
          registrationData: {},
          errors: {},
          isComplete: false,
        })
      );
    });
  });

  describe('canProceedToNextStep', () => {
    it('should return true when no errors and not at last step', () => {
      mockGet.mockReturnValue({
        currentStep: 2,
        totalSteps: 4,
        errors: {},
      });

      const result = slice.canProceedToNextStep();

      expect(result).toBe(true);
    });

    it('should return false when there are errors', () => {
      mockGet.mockReturnValue({
        currentStep: 2,
        totalSteps: 4,
        errors: { email: 'Invalid email' },
      });

      const result = slice.canProceedToNextStep();

      expect(result).toBe(false);
    });

    it('should return false when at last step', () => {
      mockGet.mockReturnValue({
        currentStep: 4,
        totalSteps: 4,
        errors: {},
      });

      const result = slice.canProceedToNextStep();

      expect(result).toBe(false);
    });
  });

  describe('getStepData', () => {
    it('should return data for specific step', () => {
      const registrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 12345 67890',
        farmName: 'Test Farm',
      };

      mockGet.mockReturnValue({ registrationData });

      const stepData = slice.getStepData(1);

      // Assuming step 1 fields are name and email
      expect(stepData).toBeDefined();
      expect(typeof stepData).toBe('object');
    });
  });
});
