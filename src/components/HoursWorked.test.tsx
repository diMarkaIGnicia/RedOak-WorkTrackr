import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HoursWorkedForm, HoursWorkedFormValues } from './HoursWorkedForm';

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};
// @ts-ignore
global.navigator.geolocation = mockGeolocation;

describe('HoursWorkedForm', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    role: 'employee',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no permite submit sin ubicación', async () => {
    render(<HoursWorkedForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Fecha/i), { target: { value: '2025-07-11' } });
    fireEvent.change(screen.getByLabelText(/Cliente/i), { target: { value: 'Cliente Test' } });
    fireEvent.change(screen.getByLabelText(/Tipo de Trabajo/i), { target: { value: 'Doméstico' } });
    fireEvent.change(screen.getByLabelText(/Horas Trabajadas/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Tarifa por Hora/i), { target: { value: '100' } });
    fireEvent.click(screen.getByText(/Crear/i));
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('permite submit cuando la ubicación es capturada', async () => {
    // Simula geolocalización exitosa
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success: any) => {
      success({ coords: { latitude: 1, longitude: 2, accuracy: 10 } });
    });
    render(<HoursWorkedForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Fecha/i), { target: { value: '2025-07-11' } });
    fireEvent.change(screen.getByLabelText(/Cliente/i), { target: { value: 'Cliente Test' } });
    fireEvent.change(screen.getByLabelText(/Tipo de Trabajo/i), { target: { value: 'Doméstico' } });
    fireEvent.change(screen.getByLabelText(/Horas Trabajadas/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Tarifa por Hora/i), { target: { value: '100' } });
    // Click obtener ubicación
    fireEvent.click(screen.getByText(/Obtener ubicación/i));
    await waitFor(() => expect(screen.getByText(/Ubicación capturada/)).toBeInTheDocument());
    // Click submit
    fireEvent.click(screen.getByText(/Crear/i));
    await waitFor(() => expect(defaultProps.onSubmit).toHaveBeenCalled());
  });

  it('solo muestra el campo estado si es admin y edición', () => {
    const initialValues: HoursWorkedFormValues = {
      date_worked: '2025-07-11',
      customer_id: 'Cliente',
      type_work: 'Doméstico',
      hours: 1,
      rate_hour: 100,
      state: 'Creada',
      // id simulado para edición
      id: '123',
    } as any;
    render(<HoursWorkedForm {...defaultProps} role="administrator" initialValues={initialValues} />);
    expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument();
  });

  it('no muestra el campo estado si es empleado o creación', () => {
    render(<HoursWorkedForm {...defaultProps} role="employee" />);
    expect(screen.queryByLabelText(/Estado/i)).not.toBeInTheDocument();
    render(<HoursWorkedForm {...defaultProps} role="administrator" />);
    expect(screen.queryByLabelText(/Estado/i)).not.toBeInTheDocument();
  });
});
