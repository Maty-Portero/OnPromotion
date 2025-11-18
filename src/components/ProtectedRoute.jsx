// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Muestra un indicador de carga mientras Supabase verifica la sesión
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.5rem', color: '#3b82f6' }}>
        Verificando sesión...
      </div>
    );
  }

  // 2. Si el usuario NO está logueado, redirige a /auth
  if (!user) {
    // Usamos Navigate y pasamos el estado 'from' para que el usuario sepa a dónde volver
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 3. Si el usuario está logueado, renderiza el componente hijo (Checkout o Account)
  return children;
};