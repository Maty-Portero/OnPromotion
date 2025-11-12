// src/components/ProductList.jsx
import React from 'react';
import { useCartStore } from '../store/cartStore';

// Mock Data con un placeholder para la URL de la imagen
const MOCK_PRODUCTS = [
  { id: 101, name: "Pañuelos", price: 150.00, imageUrl: 'https://www.onpromotion.com.ar/uploads/productos/405/15_panuelos.jpg' },
  { id: 102, name: "Conservadora Bolso Térmico Coleman", price: 85.50, imageUrl: 'https://www.onpromotion.com.ar/uploads/productos/405/4_conservadora-bolso-termico-coleman.jpg' },
  { id: 103, name: "Mochila Bison Leaf County", price: 29.99, imageUrl: 'https://www.onpromotion.com.ar/uploads/productos/405/16_mochila-bison-leaf-county.jpg' },
  { id: 104, name: "Headset USB on-ear Trust HS-200", price: 150.00, imageUrl: 'https://www.onpromotion.com.ar/uploads/productos/405/13_headset-usb-on-ear-trust-hs-200.jpg' },
  { id: 105, name: "Marcador Permanente Sharpie Mini", price: 85.50, imageUrl: 'https://www.onpromotion.com.ar/uploads/productos/405/9_marcador-permanente-sharpie-mini.jpg' },
  { id: 106, name: "Cuaderno A4 Liso Studio", price: 29.99, imageUrl: 'https://www.onpromotion.com.ar/uploads/productos/405/10_cuaderno-a5-petroleo-vacavaliente.jpg' },
];

export const ProductList = () => {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <> {/* Usamos un fragmento para envolver el título y el contenedor */}
      <h2 className="product-list-title">Productos de OnPromotion</h2> {/* Clase para centrar */}
      
      <div className="product-list-grid"> {/* Nueva clase para el grid */}
        {MOCK_PRODUCTS.map((product) => (
          <div key={product.id} className="product-item">
            {/* AGREGAMOS LA IMAGEN */}
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="product-image"
            />
            
            <div className="product-details">
              <p><strong>{product.name}</strong></p>
              <p className="product-price">${product.price.toFixed(2)}</p>
            </div>

            <button onClick={() => addToCart(product)}>
              ➕ Añadir al Carrito
            </button>
          </div>
        ))}
      </div>
    </>
  );
};