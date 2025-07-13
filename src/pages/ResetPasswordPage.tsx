import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!password || password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage('¡Contraseña actualizada! Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white p-3 sm:p-8 rounded-3xl shadow-[0_8px_40px_rgba(0,98,139,0.28)] border border-blue-dark/50 w-full max-w-xs sm:max-w-md flex flex-col items-center animate-fade-in-up overflow-hidden">
        <div className="mb-4 flex flex-col items-center">
          <img src="/logo.png" alt="RedOak Logo" className="w-40 h-20 sm:w-64 sm:h-32 mb-2 drop-shadow-xl transition-transform hover:scale-105" />
        </div>
        <div className="w-full flex flex-col items-center mb-4 animate-fade-in">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-dark mb-1">Restablecer contraseña</h2>
          <p className="text-gray-500 text-sm sm:text-base text-center">Ingresa la nueva contraseña para tu cuenta</p>
        </div>
        <form className="flex flex-col gap-4 w-full mt-2" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 border border-blue/20 focus-within:border-blue-dark focus-within:ring-2 focus-within:ring-blue/20 p-2 rounded-xl transition outline-none shadow bg-white mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue opacity-80">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.125A4.125 4.125 0 008.25 7.125V10.5m11.25 0v7.125a2.625 2.625 0 01-2.625 2.625h-12a2.625 2.625 0 01-2.625-2.625V10.5m17.25 0a2.625 2.625 0 00-2.625-2.625h-12A2.625 2.625 0 002.25 10.5" />
            </svg>
            <input
              className="flex-1 bg-transparent outline-none border-none placeholder-gray-400 text-base"
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="flex items-center gap-2 border border-blue/20 focus-within:border-blue-dark focus-within:ring-2 focus-within:ring-blue/20 p-2 rounded-xl transition outline-none shadow bg-white mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue opacity-80">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.125A4.125 4.125 0 008.25 7.125V10.5m11.25 0v7.125a2.625 2.625 0 01-2.625 2.625h-12a2.625 2.625 0 01-2.625-2.625V10.5m17.25 0a2.625 2.625 0 00-2.625-2.625h-12A2.625 2.625 0 002.25 10.5" />
            </svg>
            <input
              className="flex-1 bg-transparent outline-none border-none placeholder-gray-400 text-base"
              type="password"
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange to-blue hover:from-orange/90 hover:to-blue/90 transition text-white py-3 rounded-xl font-bold text-lg shadow-xl hover:scale-[1.03] active:scale-100 focus:ring-2 focus:ring-blue/20 disabled:opacity-50 mt-2"
            type="submit"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15m0 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {loading ? (
              <span className="flex items-center gap-2"><span className="loader loader-sm border-white"></span> Guardando...</span>
            ) : 'Guardar contraseña'}
          </button>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center rounded-lg py-2 px-3 animate-fade-in mt-2 shadow-sm">{error}</div>}
          {message && <div className="bg-green-50 border border-green-200 text-green-700 text-sm text-center rounded-lg py-2 px-3 animate-fade-in mt-2 shadow-sm">{message}</div>}
        </form>
        <div className="mt-6 text-xs text-gray text-center pb-2">© {new Date().getFullYear()} RedOak. Todos los derechos reservados.</div>
      </div>
    </div>
  );
}
