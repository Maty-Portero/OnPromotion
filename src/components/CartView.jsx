// src/components/CartView.jsx
import React from 'react';
import { useCartStore } from '../store/cartStore';

export const CartView = () => {
  const { items, removeFromCart, getCartTotal } = useCartStore();

  return (
    <div className="cart-view">
      <h2>Carrito</h2>
      {items.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                {item.name} (x{item.quantity}) - $
                {(item.price * item.quantity).toFixed(2)}
                <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: '10px' }}>
                  ❌
                </button>
              </li>
            ))}
          </ul>
          <h3>Total: ${getCartTotal()}</h3>
        </>
      )}
    </div>
  );
};