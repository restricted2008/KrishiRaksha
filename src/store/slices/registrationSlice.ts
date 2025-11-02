import { StateCreator } from 'zustand';

export interface RegistrationData {
  // Personal Info
  name?: string;
  email?: string;
  phone?: string;
  
  // Role-specific
  role?: 'farmer' | 'distributor' | 'retailer' | 'consumer';
  farmName?: string;
  location?: string;
  companyName?: string;
  
  // Additional
  address?: string;
  aadharNumber?: string;
  panNumber?: string;
}

export interface RegistrationSlice {
  // State
  registrationData: RegistrationData;
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  errors: Record<string, string>;

  // Actions
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  completeRegistration: () => void;
  resetRegistration: () => void;
}

const initialState = {
  registrationData: {},
  currentStep: 0,
  totalSteps: 3,
  isCompleted: false,
  errors: {},
};

export const createRegistrationSlice: StateCreator<RegistrationSlice> = (set, get) => ({
  ...initialState,

  updateRegistrationData: (data) =>
    set((state) => ({
      registrationData: { ...state.registrationData, ...data },
    })),

  setCurrentStep: (step) =>
    set({ currentStep: Math.max(0, Math.min(step, get().totalSteps)) }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  setErrors: (errors) => set({ errors }),

  clearErrors: () => set({ errors: {} }),

  completeRegistration: () =>
    set({
      isCompleted: true,
      currentStep: get().totalSteps,
    }),

  resetRegistration: () => set(initialState),
});
