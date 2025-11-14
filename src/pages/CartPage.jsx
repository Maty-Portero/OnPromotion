// src/pages/CartPage.jsx (CORREGIDO)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export const CartPage = () => {
  // 🚩 CAMBIO: Reemplazamos 'removeFromCart' por 'decreaseQuantity'
  const { items, getCartTotal, decreaseQuantity, clearCart } = useCartStore();
  const navigate = useNavigate();

  const totalAmount = getCartTotal();
  // Nos aseguramos de manejar el caso donde totalAmount podría ser undefined/null/0
  const finalTotalForDisplay = totalAmount ? parseFloat(totalAmount).toFixed(2) : '0.00';

  const handleCheckout = () => {
    // Navega a la página de Checkout 
    navigate('/checkout');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1>Tu Carrito de Compras</h1>
      
      {items.length === 0 ? (
        <p>Tu carrito está vacío. ¡Añade algunos productos!</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>
                  {item.name} (x{item.quantity}) - ${item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}
                </span>
                <button 
                  // 🚩 CAMBIO CRÍTICO: Usamos la nueva función para reducir 1 unidad
                  onClick={() => decreaseQuantity(item.id)}
                  style={{ 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    padding: '5px 10px', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '20px', borderTop: '2px solid #333', paddingTop: '10px' }}>
            <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
              Total: ${finalTotalForDisplay}
            </p>
            
            <button 
              onClick={handleCheckout}
              style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '5px', 
                cursor: 'pointer', 
                fontSize: '1.2em',
                marginRight: '10px'
              }}
            >
              🛒 Ir a Pagar
            </button>
            <button 
              onClick={clearCart}
              style={{ 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '5px', 
                cursor: 'pointer'
              }}
            >
              Vaciar Carrito
            </button>
          </div>
        </>
      )}
    </div>
  );
};