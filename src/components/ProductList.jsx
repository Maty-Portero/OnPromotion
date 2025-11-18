// src/components/ProductList.jsx
import React, { useEffect, useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom'; 
import { supabase } from '../supabase/supabaseClient'; // Importar supabase

export const ProductList = () => {
  const { addToCart } = useCartStore();
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);

  // FUNCIÓN PARA CARGAR PRODUCTOS DESDE SUPABASE
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error("Error al cargar productos:", error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
  };
  
  if (loading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando productos...</h2>;
  }
  
  if (products.length === 0) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>No hay productos disponibles.</h2>;
  }

  return (
    <div className="product-list-container" style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Productos Destacados</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '30px' 
      }}>
        {products.map((product) => (
          <div 
            className="product-card" 
            key={product.id} 
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#fff',
              boxShadow: 'var(--shadow-light)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {/* Imagen */}
            <div style={{ 
              width: '100%', 
              height: '180px', 
              marginBottom: '15px', 
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <img 
                src={product.imageUrl} 
                alt={product.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  borderRadius: '6px'
                }}
              />
            </div>
            
            <div className="product-details" style={{ flexGrow: 1 }}>
              <h4 style={{ margin: '5px 0' }}>{product.name}</h4>
              <p className="product-price" style={{ fontWeight: 'bold', color: '#c35555', fontSize: '1.4rem', marginTop: '10px', marginBottom: '15px' }}>
                ${parseFloat(product.price).toFixed(2)}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <Link 
                to={`/product/${product.id}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '10px 5px',
                  backgroundColor: 'rgb(195, 85, 85)', 
                  color: 'white',
                  textDecoration: 'none', 
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Ver <br />Más
              </Link>
          
              <button 
                onClick={() => handleAddToCart(product)}
                style={{ 
                  flex: 1,
                  backgroundColor: '#0FA0CE',
                  color: 'white',
                  padding: '10px 5px',
                  borderRadius: '5px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Añadir al Carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};