// src/App.jsx (CORREGIDO Y ACTUALIZADO)
import React from 'react';
// Importaciones consolidadas: eliminamos la doble declaración
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'; 

// Importaciones para el nuevo icono del carrito
import { FaShoppingCart } from 'react-icons/fa'; // 🚩 Asegúrate de tener 'react-icons' instalado
import { useCartStore } from './store/cartStore'; 

// Tus importaciones de componentes y servicios
import { ProductList } from './components/ProductList';
import { Checkout } from './pages/Checkout';
import { Account } from './pages/Account'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AuthForm from './components/AuthForm';
import { CartPage } from './pages/CartPage'; 
import './App.css';

// Importa tu archivo de logo (AJUSTA ESTA RUTA SI ES NECESARIO)
import OnPromotionLogo from './assets/onpromotion_logo.jpg'; 

// Componente que maneja el contenido, la navegación y el layout (header/footer)
const AppContent = () => {
  const { isLoggedIn, signOut, loading } = useAuth();
  
  // Usamos el store del carrito para obtener el contador de items
  const { items } = useCartStore();
  const itemCount = Array.isArray(items) ? items.reduce((total, item) => total + (item.quantity || 0), 0) : 0;

  const handleLogout = () => {
    signOut();
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.5rem', color: '#3b82f6' }}>
        Cargando sesión...
      </div>
    );
  }

  return (
    <>
      {/* -------------------- NAVEGACIÓN (HEADER) -------------------- */}
      <nav>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>

          {/* LOGO COMO LINK DE INICIO (HOME) */}
          <Link to="/" style={{ padding: '0', background: 'none' }}>
            <img
              src={OnPromotionLogo}
              alt="Logo OnPromotion"
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>

          {/* Enlace condicional a "Mi Cuenta" */}
          {isLoggedIn && (
            <Link to="/account">Mi Cuenta</Link>
          )}

        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Botón de Logout o Link de Login */}
          {isLoggedIn ? (
            <button onClick={handleLogout} className="nav-button">Logout</button>
          ) : (
            <Link to="/login">Login</Link>
          )}

          {/* 🚩 NUEVO BOTÓN/ICONO DEL CARRITO */}
          <Link to="/cart" style={{ position: 'relative', color: '#1f2937', textDecoration: 'none', fontSize: '1.5em' }}>
            <FaShoppingCart />
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: '#c35555', // Usando tu color primario
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.6em',
                fontWeight: 'bold',
                lineHeight: '1',
              }}>
                {itemCount}
              </span>
            )}
          </Link>
          
          {/* 🚩 ELIMINAMOS <CartView /> de aquí. Ahora el icono lleva a CartPage */}
        </div>
      </nav>

      {/* -------------------- CONTENIDO (ROUTES) -------------------- */}
      {/* Añadimos minHeight para empujar el footer hacia abajo */}
      <div style={{ padding: '20px', minHeight: '60vh' }}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<ProductList />} />
          <Route path="/login" element={<AuthForm />} />
          
          {/* 🚩 RUTA PÚBLICA PARA EL CARRITO (MOVIDA AQUÍ, DENTRO DE <Routes>) */}
          <Route path="/cart" element={<CartPage />} />

          {/* Rutas Protegidas (Requieren Login) */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* -------------------- PIE DE PÁGINA (FOOTER) -------------------- */}
      <footer className="app-footer">
        <div className="footer-content">

          <div className="footer-section">
            <h4>Sobre OnPromotion</h4>
            <p>La solución líder en gestión de promociones digitales.</p>
          </div>

          <div className="footer-section footer-links">
            <h4>Enlaces Rápidos</h4>
            <a href="#">Términos y Condiciones</a>
            <a href="#">Política de Privacidad</a>
          </div>

          <div className="footer-section footer-contact">
            <h4>Contacto</h4>
            <p>Email: soporte@onpromotion.com</p>
            <p>Tel: +54 11 5555-1234</p>
          </div>

        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} OnPromotion. Todos los derechos reservados.
        </div>
      </footer>

    </>
  );
};

// Componente App que envuelve todo en el Router y el AuthProvider
const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </AuthProvider>
);

export default App;