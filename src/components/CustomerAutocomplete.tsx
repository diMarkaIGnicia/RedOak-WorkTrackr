import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

interface Customer {
  id: string;
  full_name: string;
  phone_numbers?: string[];
  emails?: string[];
  service_addresses?: string[];
}

interface CustomerAutocompleteProps {
  value: string;
  onChange: (id: string, name: string) => void;
  readOnly?: boolean;
  className?: string;
}

const CustomerAutocomplete: React.FC<CustomerAutocompleteProps> = ({ value, onChange, readOnly, className }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Si value cambia (por ejemplo en edición o cambio externo), cargar el nombre del cliente y actualizar inputValue
  useEffect(() => {
    if (value) {
      supabase
        .from('customers')
        .select('full_name')
        .eq('id', value)
        .single()
        .then(({ data }) => {
          if (data?.full_name) setInputValue(data.full_name);
        });
    } else {
      setInputValue('');
    }
  }, [value]);

  // Buscar clientes por nombre
  const fetchSuggestions = async (query: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name')
      .ilike('full_name', `%${query}%`)
      .order('full_name')
      .limit(10);
    setSuggestions(data || []);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setShowSuggestions(true);
    if (val.length >= 2) {
      fetchSuggestions(val);
    } else {
      setSuggestions([]);
    }
    // Cuando el usuario edita, limpiar selección previa
    if (value) onChange('', '');
  };

  const handleSuggestionClick = (customer: Customer) => {
    setInputValue(customer.full_name);
    setShowSuggestions(false);
    onChange(customer.id, customer.full_name);
  };



  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        className={className || "border border-gray-400 rounded px-2 py-1 w-full sm:text-sm"}
        placeholder="Buscar cliente..."
        disabled={readOnly}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
          {loading && <li className="px-4 py-2 text-gray-500">Buscando...</li>}
          {suggestions.map((customer) => (
            <li
              key={customer.id}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              onMouseDown={() => handleSuggestionClick(customer)}
            >
              {customer.full_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerAutocomplete;
