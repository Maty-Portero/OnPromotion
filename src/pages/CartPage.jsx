// src/pages/CartPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore'; 

export const CartPage = () => {
  // 🚩 Importamos las funciones necesarias, incluyendo la nueva decrementQuantity
  const { 
    items, 
    getCartTotal, 
    removeFromCart, 
    clearCart, 
    decrementQuantity,
    // addToCart no se desestructura aquí, pero se puede acceder vía useCartStore.getState().addToCart
  } = useCartStore(); 
  
  const navigate = useNavigate();

  const totalAmount = getCartTotal();
  // El totalAmount ya está formateado a string con toFixed(2) dentro del store, 
  // pero lo parseamos para asegurarnos si la store devuelve un número o string.
  const finalTotalForDisplay = parseFloat(totalAmount) ? parseFloat(totalAmount).toFixed(2) : '0.00';

  const handleCheckout = () => {
    // Navega a la página de Checkout (donde está la lógica de pago y PDF)
    navigate('/checkout');
  };

  // Función auxiliar para incrementar la cantidad (reutilizando addToCart)
  const handleIncrement = (item) => {
    // Usamos useCartStore.getState() para acceder a la función addToCart si no la desestructuramos
    useCartStore.getState().addToCart(item);
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Tu Carrito de Compras</h1>
      
      {items.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.2em' }}>Tu carrito está vacío. ¡Añade algunos productos!</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => (
              <li 
                key={item.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '15px 0', 
                  borderBottom: '1px solid #ddd',
                  gap: '10px'
                }}
              >
                {/* Nombre y Precio Unitario */}
                <span style={{ flexGrow: 1, fontSize: '1.1em' }}>
                  {item.name} (${item.price ? item.price.toFixed(2) : '0.00'})
                </span>

                {/* Controles de Cantidad */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  
                  {/* BOTÓN PARA DECREMENTAR (Quitar de a 1) */}
                  <button 
                    onClick={() => decrementQuantity(item.id)} // 👈 Llama a la nueva función
                    style={{ 
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px 0 0 4px',
                      cursor: 'pointer',
                      fontSize: '1em'
                    }}
                  >
                    -
                  </button>
                  
                  <span style={{ padding: '5px 15px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
                    {item.quantity}
                  </span>
                  
                  {/* BOTÓN PARA INCREMENTAR */}
                  <button 
                    onClick={() => handleIncrement(item)} 
                    style={{ 
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '0 4px 4px 0',
                      cursor: 'pointer',
                      fontSize: '1em'
                    }}
                  >
                    +
                  </button>
                </div>
                
                {/* Total por Producto */}
                <span style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right', color: '#1d4ed8' }}>
                    ${item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}
                </span>

                {/* Botón para ELIMINAR COMPLETAMENTE */}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{ 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 15px', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }}
                >
                  Eliminar Todo
                </button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '30px', borderTop: '2px solid #333', paddingTop: '15px', textAlign: 'right' }}>
            <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#333', margin: '0 0 20px 0' }}>
              Total: ${finalTotalForDisplay}
            </p>
            
            <button 
              onClick={handleCheckout}
              style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '12px 25px', 
                borderRadius: '5px', 
                cursor: 'pointer', 
                fontSize: '1.2em',
                marginRight: '15px',
                fontWeight: 'bold'
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
                padding: '12px 25px', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontSize: '1.2em',
                fontWeight: 'bold'
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