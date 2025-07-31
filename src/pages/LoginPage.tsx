import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      if (error.message === 'Invalid login credentials') {
        setError('Credenciales inválidas, verifica tu correo y contraseña');
      } else {
        setError(error.message);
      }
      return;
    }
    // Buscar usuario en tabla users por email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, active')
      .eq('email', email)
      .single();
    setLoading(false);
    if (userError) {
      setError('No se pudo validar el estado del usuario.');
      // Opcional: cerrar sesión si hay error
      await supabase.auth.signOut();
      return;
    }
    if (!userData?.active) {
      setError('Tu usuario está inactivo. Contacta al administrador.');
      await supabase.auth.signOut();
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">

      <div className="bg-white p-3 sm:p-8 rounded-3xl shadow-[0_8px_40px_rgba(0,98,139,0.28)] border border-blue-dark/50 w-full max-w-xs sm:max-w-md flex flex-col items-center animate-fade-in-up overflow-hidden">
        {/* Logo SVG */}
        <div className="mb-4 flex flex-col items-center">
          <img src="/logo.png" alt="RedOak Logo" className="w-40 h-20 sm:w-64 sm:h-32 mb-2 drop-shadow-xl transition-transform hover:scale-105" />
        </div>
        <div className="w-full flex flex-col items-center mb-4 animate-fade-in">
          <p className="text-gray-500 text-sm  sm:text-base text-center">Gestiona tus tareas fácil y seguro</p>
        </div>
        <form className="flex flex-col gap-4 w-full mt-2" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 border border-blue/20 focus-within:border-blue-dark focus-within:ring-2 focus-within:ring-blue/20 p-2 rounded-xl transition outline-none shadow bg-white mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue opacity-80">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75m19.5 0v.243a2.25 2.25 0 01-.876 1.8l-7.5 5.625a2.25 2.25 0 01-2.748 0l-7.5-5.625a2.25 2.25 0 01-.876-1.8V6.75" />
            </svg>
            <input
              className="flex-1 bg-transparent outline-none border-none placeholder-gray-400 text-base"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
           <div className="flex items-center gap-2 border border-blue/20 focus-within:border-blue-dark focus-within:ring-2 focus-within:ring-blue/20 p-2 rounded-xl transition outline-none shadow bg-white mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue opacity-80">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.125A4.125 4.125 0 008.25 7.125V10.5m11.25 0v7.125a2.625 2.625 0 01-2.625 2.625h-12a2.625 2.625 0 01-2.625-2.625V10.5m17.25 0a2.625 2.625 0 00-2.625-2.625h-12A2.625 2.625 0 002.25 10.5" />
            </svg>
            <input
              className="flex-1 bg-transparent outline-none border-none placeholder-gray-400 text-base"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="ml-2 focus:outline-none"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue opacity-80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M19.5 12.75C18.75 10.5 16.5 7.5 12 7.5c-1.5 0-2.75.25-3.75.75M6.75 6.75C5.25 8.25 3.75 10.5 3.75 12.75c.75 2.25 3 5.25 8.25 5.25 1.5 0 2.75-.25 3.75-.75" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue opacity-80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-7.5 0-9.75 7.5-9.75 8.25s2.25 8.25 9.75 8.25 9.75-7.5 9.75-8.25S19.5 4.5 12 4.5zM12 15.75A3.75 3.75 0 1112 8.25a3.75 3.75 0 010 7.5z" />
                </svg>
              )}
            </button>
          </div>
          <button
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark transition text-white py-3 rounded-xl font-bold text-lg shadow-xl hover:scale-[1.03] active:scale-100 focus:ring-2 focus:ring-primary/30 disabled:opacity-50 mt-2"
            type="submit"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15m0 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {loading ? (
              <span className="flex items-center gap-2"><span className="loader loader-sm border-white"></span> Ingresando...</span>
            ) : 'Iniciar sesión'}
          </button>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center rounded-lg py-2 px-3 animate-fade-in mt-2 shadow-sm">{error}</div>}
          <div className="w-full flex justify-end">
            <a href="/forgot-password" className="text-blue text-xs underline underline-offset-2 hover:text-blue-dark transition-colors animate-fade-in cursor-pointer">¿Olvidaste tu contraseña?</a>
          </div>
        </form>
        <div className="mt-6 text-xs text-gray text-center pb-2">
          © {new Date().getFullYear()} RedOak.
          <br />
          Desarrollado por <a href="https://dimarka.com" target="_blank" rel="noopener noreferrer" className="text-blue text-xs underline underline-offset-2 hover:text-blue-dark transition-colors animate-fade-in cursor-pointer">diMarka</a>.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
