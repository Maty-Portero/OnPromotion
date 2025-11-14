// src/components/Header.jsx (Fragmento, solo las partes que cambian)
import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa'; // IMPORTAR ICONO
import { useCartStore } from '../store/cartStore'; // IMPORTAR STORE

export const Header = () => {
  // Obtener el número total de items para mostrar en el icono
  const { items } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', backgroundColor: '#333', color: 'white' }}>
      
      {/* 1. Links de Navegación (Se mantienen) */}
      <div>
        <Link to="/" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>Inicio</Link>
        <Link to="/account" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>Mi Cuenta</Link>
        {/* ELIMINAR CUALQUIER LINK A /CHECKOUT O BOTÓN 'PAGAR' QUE ESTUVIERA AQUÍ */}
      </div>

      {/* 2. Botón del Carrito (El nuevo ícono) */}
      <Link to="/cart" style={{ position: 'relative', color: 'white', textDecoration: 'none', fontSize: '1.5em' }}>
        <FaShoppingCart />
        {itemCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            backgroundColor: '#ffc107',
            color: 'black',
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
    </nav>
  );
};