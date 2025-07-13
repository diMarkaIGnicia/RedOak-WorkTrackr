import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskForm, TaskFormValues } from './TaskForm';

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};
// @ts-ignore
global.navigator.geolocation = mockGeolocation;

describe('TaskForm', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    rol: 'empleado',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no permite submit sin ubicación', async () => {
    render(<TaskForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Fecha Inicio/i), { target: { value: '2025-07-11' } });
    fireEvent.change(screen.getByLabelText(/Hora Inicio/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/Cliente/i), { target: { value: 'Cliente Test' } });
    fireEvent.change(screen.getByLabelText(/Tipo de Trabajo/i), { target: { value: 'Doméstico' } });
    fireEvent.change(screen.getByLabelText(/Horas Trabajadas/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Tarifa por Hora/i), { target: { value: '100' } });
    fireEvent.click(screen.getByText(/Crear/i));
    expect(await screen.findByText(/Debes capturar tu ubicación/)).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('permite submit cuando la ubicación es capturada', async () => {
    // Simula geolocalización exitosa
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success: any) => {
      success({ coords: { latitude: 1, longitude: 2, accuracy: 10 } });
    });
    render(<TaskForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Fecha Inicio/i), { target: { value: '2025-07-11' } });
    fireEvent.change(screen.getByLabelText(/Hora Inicio/i), { target: { value: '10:00' } });
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
    const initialValues: TaskFormValues = {
      fecha_inicio: '2025-07-11',
      hora_inicio: '10:00',
      cliente: 'Cliente',
      tipo_trabajo: 'Doméstico',
      horas_trabajadas: 1,
      tarifa_por_hora: 100,
      estado: 'Creada',
      descripcion: '',
      ubicacion: undefined,
      observations: [],
      // id simulado para edición
      id: '123',
    } as any;
    render(<TaskForm {...defaultProps} rol="administrador" initialValues={initialValues} />);
    expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument();
  });

  it('no muestra el campo estado si es empleado o creación', () => {
    render(<TaskForm {...defaultProps} rol="empleado" />);
    expect(screen.queryByLabelText(/Estado/i)).not.toBeInTheDocument();
    render(<TaskForm {...defaultProps} rol="administrador" />);
    expect(screen.queryByLabelText(/Estado/i)).not.toBeInTheDocument();
  });
});
