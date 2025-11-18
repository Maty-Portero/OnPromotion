// src/pages/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Estado inicial del formulario
const initialProduct = { name: '', price: '', description: '', imageUrl: '' };

export const AdminProducts = () => {
    const { isAdmin, loading } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(initialProduct);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // REDIRECCIÓN DE SEGURIDAD: Si no es admin, fuera.
    useEffect(() => {
        if (!loading && !isAdmin) {
            alert("Acceso denegado. No tienes permisos de administrador.");
            navigate('/account');
        }
    }, [isAdmin, loading, navigate]);
    
    // Cargar productos desde Supabase
    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });

        if (error) {
            setError("Error al cargar productos: " + error.message);
        } else {
            setProducts(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isAdmin) { // Solo carga si es admin
            fetchProducts();
        }
    }, [isAdmin]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Preparar datos y validar precio
        const productToSave = { 
            ...currentProduct, 
            price: parseFloat(currentProduct.price) 
        };
        if (isNaN(productToSave.price)) {
            setError("El precio debe ser un número válido.");
            return;
        }

        try {
            if (isEditing) {
                // UPDATE
                const { error } = await supabase
                    .from('products')
                    .update(productToSave)
                    .eq('id', currentProduct.id);
                if (error) throw error;
            } else {
                // INSERT
                const { error } = await supabase
                    .from('products')
                    .insert([productToSave]);
                if (error) throw error;
            }
            
            setCurrentProduct(initialProduct);
            setIsEditing(false);
            fetchProducts();
        } catch (err) {
            console.error("Error al guardar producto:", err);
            setError("Error al guardar: " + err.message);
        }
    };
    
    const handleEdit = (product) => {
        // Cargar el producto para edición
        setCurrentProduct({ ...product, price: product.price.toString() }); 
        setIsEditing(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Estás seguro de eliminar el producto: "${name}"?`)) return;
        
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            
            fetchProducts();
            if (currentProduct.id === id) {
                setCurrentProduct(initialProduct);
                setIsEditing(false);
            }
        } catch (err) {
            console.error("Error al eliminar producto:", err);
            setError("Error al eliminar: " + err.message);
        }
    };

    if (loading || !isAdmin) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando zona de administración...</div>;
    }
    
    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
            <h1>Zona de Administración de Productos</h1>

            {/* Formulario de Añadir/Editar */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #c35555', borderRadius: '8px', backgroundColor: '#fef3f2' }}>
                <h2 style={{ color: '#c35555' }}>{isEditing ? `Editando: ${currentProduct.name}` : 'Añadir Nuevo Producto'}</h2>
                
                {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>}
                
                <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input type="text" name="name" placeholder="Nombre del Producto" value={currentProduct.name} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="number" name="price" placeholder="Precio ($)" value={currentProduct.price} onChange={handleChange} step="0.01" required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="text" name="imageUrl" placeholder="URL de la Imagen" value={currentProduct.imageUrl} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', gridColumn: 'span 2' }} />
                    <textarea name="description" placeholder="Descripción del Producto" value={currentProduct.description} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', gridColumn: 'span 2', minHeight: '80px' }} />
                    
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1, backgroundColor: isEditing ? '#2563eb' : '#28a745', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
                            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={() => { setIsEditing(false); setCurrentProduct(initialProduct); setError(null); }} style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
                                Cancelar Edición
                            </button>
                        )}
                    </div>
                </form>
            </div>
            
            <hr style={{ margin: '30px 0' }}/>
            
            {/* Lista de Productos */}
            <h2>Lista de Productos ({products.length})</h2>
            
            {isLoading ? (
                <p>Cargando lista...</p>
            ) : products.length === 0 ? (
                <p>No hay productos en la base de datos.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                    {products.map((product) => (
                        <div key={product.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <img src={product.imageUrl} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} />
                            <div style={{ flexGrow: 1, textAlign: 'left' }}>
                                <p style={{ fontWeight: 'bold', margin: '0' }}>{product.name}</p>
                                <p style={{ margin: '0', color: '#c35555' }}>${parseFloat(product.price).toFixed(2)}</p>
                            </div>
                            <button onClick={() => handleEdit(product)} style={{ backgroundColor: '#ffc107', color: 'black', padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', marginRight: '10px' }}>
                                Editar
                            </button>
                            <button onClick={() => handleDelete(product.id, product.name)} style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                                Eliminar
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};