// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../supabase/supabaseClient'; // Importar supabase

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  
  const [product, setProduct] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  // FUNCIÓN PARA CARGAR EL PRODUCTO POR ID DESDE SUPABASE
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const productId = parseInt(id);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single(); 

      if (error) {
        console.error("Error al cargar el producto:", error);
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product); 
    }
  };

  if (loading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando detalles del producto...</h2>;
  }
  
  if (!product) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Producto no encontrado</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          marginBottom: '20px', 
          backgroundColor: '#6c757d', 
          color: 'white', 
          padding: '10px 15px', 
          borderRadius: '5px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        ← Volver a Productos
      </button>
      
      <div style={{ display: 'flex', gap: '40px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
        
        {/* Columna de Imagen */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            width: '100%', 
            height: '400px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <img 
              src={product.imageUrl} 
              alt={product.name}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain', 
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
        
        {/* Columna de Detalles */}
        <div style={{ flex: 2 }}>
          <h1 style={{ marginBottom: '10px' }}>{product.name}</h1>
          <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#c35555' }}>${parseFloat(product.price).toFixed(2)}</p>
          
          <h3 style={{ marginTop: '30px' }}>Descripción</h3>
          <p>{product.description || 'No hay descripción disponible para este producto.'}</p>
          
          <button 
            onClick={handleAddToCart}
            style={{ 
              marginTop: '30px',
              backgroundColor: '#0FA0CE', 
              color: 'white', 
              padding: '12px 30px', 
              fontSize: '1.2em',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Añadir al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};