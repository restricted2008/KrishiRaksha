import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FarmerBatchForm } from '../components/FarmerBatchForm';

describe('FarmerBatchForm', () => {
  it('should render all form fields', () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    expect(screen.getByLabelText(/crop type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/variety/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/harvest date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expected price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organic certified/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should show validation errors when submitting empty form', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit batch/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/crop type is required/i)).toBeInTheDocument();
      expect(screen.getByText(/quantity is required/i)).toBeInTheDocument();
      expect(screen.getByText(/harvest date is required/i)).toBeInTheDocument();
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('should show field-level error for invalid crop type', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    const cropTypeInput = screen.getByLabelText(/crop type/i);
    await userEvent.type(cropTypeInput, 'A');
    await userEvent.tab(); // Trigger blur

    await waitFor(() => {
      expect(screen.getByText(/crop type must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('should show error for crop type with numbers', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    const cropTypeInput = screen.getByLabelText(/crop type/i);
    await userEvent.type(cropTypeInput, 'Tomato123');
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText(/crop type can only contain letters and spaces/i)).toBeInTheDocument();
    });
  });

  it('should show error for negative quantity', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    const quantityInput = screen.getByLabelText(/quantity/i);
    await userEvent.type(quantityInput, '-10');
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText(/quantity must be a positive number/i)).toBeInTheDocument();
    });
  });

  it('should show error for quantity below minimum', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    const quantityInput = screen.getByLabelText(/quantity/i);
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '0.05');
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText(/quantity must be at least 0\.1/i)).toBeInTheDocument();
    });
  });

  it('should show summary error when form has multiple validation errors', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit batch/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    // Fill in required fields with valid data
    await userEvent.type(screen.getByLabelText(/crop type/i), 'Tomato');
    await userEvent.type(screen.getByLabelText(/quantity/i), '100');
    
    const harvestDate = screen.getByLabelText(/harvest date/i);
    const today = new Date().toISOString().split('T')[0];
    fireEvent.change(harvestDate, { target: { value: today } });

    const submitButton = screen.getByRole('button', { name: /submit batch/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          cropType: 'Tomato',
          quantity: 100,
          unit: 'kg',
          organicCertified: false,
        })
      );
    });
  });

  it('should clear errors when user starts correcting them', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    // Submit to generate errors
    const submitButton = screen.getByRole('button', { name: /submit batch/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/crop type is required/i)).toBeInTheDocument();
    });

    // Start typing in crop type field
    const cropTypeInput = screen.getByLabelText(/crop type/i);
    await userEvent.type(cropTypeInput, 'Wheat');

    await waitFor(() => {
      expect(screen.queryByText(/crop type is required/i)).not.toBeInTheDocument();
    });
  });

  it('should validate optional expected price field correctly', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    const priceInput = screen.getByLabelText(/expected price/i);
    await userEvent.type(priceInput, '-5');
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText(/expected price must be a positive number/i)).toBeInTheDocument();
    });

    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '25.50');
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.queryByText(/expected price must be a positive number/i)).not.toBeInTheDocument();
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} onCancel={mockCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('should show character count for description field', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    await userEvent.type(descriptionInput, 'Test description');

    expect(screen.getByText(/16\/500 characters/i)).toBeInTheDocument();
  });

  it('should validate description length', async () => {
    const mockSubmit = vi.fn();
    render(<FarmerBatchForm onSubmit={mockSubmit} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    const longText = 'a'.repeat(501);
    await userEvent.type(descriptionInput, longText);
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText(/description must not exceed 500 characters/i)).toBeInTheDocument();
    });
  });
});
