// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useCartStore } from './store/cartStore'; // Para mostrar la cantidad en el carrito

// Importaciones de Páginas y Componentes
import { ProductList } from './components/ProductList';
import { ProductDetail } from './pages/ProductDetail'; 
import { CartPage } from './pages/CartPage'; 
import { Checkout } from './pages/Checkout';
import { Account } from './pages/Account'; 
import { AdminProducts } from './pages/AdminProducts'; // NUEVA PÁGINA DE ADMIN
import AuthForm from './components/AuthForm';

// Componentes de Autenticación y Rutas Protegidas
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute'; // Asumimos que tienes este componente

// Importación de estilos
import './App.css'; 

// Importa tu archivo de logo (AJUSTA ESTA RUTA SI ES NECESARIO)
import OnPromotionLogo from './assets/onpromotion_logo.jpg'; 

// ------------------------------------------------------------------
// Componente Header (se puede mover a un archivo separado, pero lo incluimos aquí por simplicidad)
const Header = () => {
  const { isLoggedIn, signOut, loading } = useAuth();
  const { items } = useCartStore();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    signOut();
  }

  return (
    <nav>
      <div className="nav-logo">
        <Link to="/">
          <img src={OnPromotionLogo} alt="OnPromotion Logo" style={{ height: '40px' }} />
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/">Productos</Link>
        <Link to="/cart">
          Carrito ({cartItemCount})
        </Link>
        
        {loading ? (
            <span style={{ color: '#ccc' }}>Cargando...</span>
        ) : isLoggedIn ? (
          <>
            <Link to="/account">Mi Cuenta</Link>
            <button 
              onClick={handleLogout}
              style={{ 
                backgroundColor: '#dc3545', 
                color: 'white', 
                padding: '8px 15px', 
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <Link to="/auth">Iniciar Sesión</Link>
        )}
      </div>
    </nav>
  );
};
// ------------------------------------------------------------------


// Componente que maneja el contenido, la navegación y el layout
const AppContent = () => {
  return (
    <>
      <Header />

      <div className="main-content">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/auth" element={<AuthForm />} /> 

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

          {/* NUEVA RUTA DE ADMINISTRACIÓN PROTEGIDA (Requiere Login) */}
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                {/* La validación de 'isAdmin' está dentro de AdminProducts.jsx */}
                <AdminProducts />
              </ProtectedRoute>
            }
          />

          {/* Ruta para Not Found */}
          <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>404 - Página no encontrada</h2>} />
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