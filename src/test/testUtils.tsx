import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that includes providers
 */
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

/**
 * Mock user for testing
 */
export const mockUser = {
  id: 'test-user-123',
  name: 'Test Farmer',
  email: 'farmer@test.com',
  role: 'farmer' as const,
  phone: '+91 98765 43210',
  location: 'Test Location',
  farmName: 'Test Farm',
};

/**
 * Mock batch data for testing
 */
export const mockBatch = {
  id: 'KR123456789',
  qrCode: 'KR123456789',
  cropType: 'rice',
  variety: 'Basmati',
  quantity: '100',
  unit: 'kg',
  harvestDate: '2024-01-15',
  expectedPrice: '5000',
  organicCertified: true,
  description: 'Test batch description',
  createdAt: new Date().toISOString(),
  status: 'Harvested',
  blockchainHash: '0xtest123',
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Flush promises (useful for testing async code)
 */
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));
