// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient'; 

const AuthContext = createContext();

// Hook personalizado para consumir el contexto
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios de estado de autenticación (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
    });

    // Limpiar el listener al desmontar
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error al cerrar sesión:", error);
        throw error;
    }
    setUser(null);
  };

  // LÓGICA DE ADMINISTRADOR
  // Asumimos que la cuenta de administrador registrada en Supabase es 'dueño@admin.com'
  const isAdmin = user && user.email === 'administrador@onpromotion.com'; 

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signUp, 
        signIn, 
        signOut, 
        isLoggedIn: !!user, 
        isAdmin // EXPORTAMOS EL FLAG DE ADMIN
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};