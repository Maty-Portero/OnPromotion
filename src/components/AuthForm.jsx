// src/components/AuthForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { signUp, signIn } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      if (isRegistering) {
        await signUp(email, password);
        setSuccessMessage('¡Registro exitoso! Revisa tu correo para confirmar. Luego inicia sesión.');
        setIsRegistering(false); 
      } else {
        await signIn(email, password);
        navigate('/'); 
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error en la autenticación.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{isRegistering ? 'Registro de Usuario' : 'Iniciar Sesión'}</h2>
      
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>}
      {successMessage && <p style={{ color: 'green', fontWeight: 'bold' }}>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <button type="submit" style={{ width: '100%', marginBottom: '10px' }}>
          {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        {isRegistering ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
        <button 
          type="button" 
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ background: 'none', color: '#007bff', padding: 0, textDecoration: 'underline' }}
        >
          {isRegistering ? 'Iniciar Sesión' : 'Regístrate aquí'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;