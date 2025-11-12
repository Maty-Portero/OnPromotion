// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Si no está logueado, redirige a la página de login
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, muestra el componente hijo
  return children;
};