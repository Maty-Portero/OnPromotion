// src/pages/Account.jsx
import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Link, useNavigate } from 'react-router-dom'; // Importar Link para el acceso Admin
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient'; 

// Función para descargar el PDF
const generatePDF = async (orderItems, orderId, orderDate, orderTotal) => {
  // Crear un div temporal para renderizar la factura
  const tempReceipt = document.createElement('div');
  tempReceipt.style.padding = '20px';
  tempReceipt.style.backgroundColor = '#ffffff';
  tempReceipt.style.color = '#000000';
  tempReceipt.style.maxWidth = '600px';

  let itemsHtml = '';
  
  // Renderizar los detalles de la orden en el div temporal
  orderItems.forEach(item => {
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const itemTotal = price * quantity;
    itemsHtml += `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
        <span style="flex-grow: 1;">${item.name} (x${quantity})</span>
        <span>$${itemTotal.toFixed(2)}</span>
      </div>
    `;
  });

  tempReceipt.innerHTML = `
    <h2 style="color: #c35555;">Factura de OnPromotion - Cotización #${orderId}</h2>
    <p>Fecha de Cotización: ${new Date(orderDate).toLocaleDateString()}</p>
    <hr/>
    <h3 style="margin-top: 15px;">Detalle de Productos</h3>
    ${itemsHtml}
    <hr style="border-top: 2px solid #000;"/>
    <div style="display: flex; justify-content: space-between; font-size: 1.5em; font-weight: bold; margin-top: 10px;">
        <span>TOTAL:</span>
        <span>$${orderTotal.toFixed(2)}</span>
    </div>
  `;
  
  // Añadir el div temporal al cuerpo para que html2canvas pueda renderizarlo
  document.body.appendChild(tempReceipt);

  try {
    const canvas = await html2canvas(tempReceipt, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    // Configuración de jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4'); 
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight); 
    pdf.save(`recibo-onpromotion-${orderId}.pdf`);

  } catch (err) {
    console.error("Error al generar el PDF:", err);
    alert("Hubo un error al generar el PDF.");
  } finally {
    // Limpiar el div temporal del cuerpo
    document.body.removeChild(tempReceipt);
  }
};


export const Account = () => { 
  const { user, loading: authLoading, isAdmin, signOut } = useAuth(); // IMPORTAMOS isAdmin y signOut
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Redireccionar si no está logueado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth'); 
    }
  }, [authLoading, user, navigate]);


  // Cargar historial de órdenes del usuario
  const fetchOrders = async () => {
    if (!user) return; 

    setDataLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id) // Filtrar solo las órdenes de este usuario
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error al cargar órdenes:", error);
    } else {
      // Aseguramos que items_json sea parseado si se guardó como texto (aunque Supabase lo guarda como JSONB)
      const parsedData = data.map(order => ({
        ...order,
        items_json: typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json
      }));
      setOrders(parsedData);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]); // Recargar al cambiar de usuario

  
  if (authLoading || dataLoading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando datos de la cuenta...</h2>;
  }
  
  if (!user) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Debes iniciar sesión para ver tu cuenta.</h2>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
      <h1>Mi Cuenta: Historial de Cotización</h1>
      
      <p>Usuario: <strong>{user.email}</strong></p>
      
      {/* 🚩 ZONA DE ADMINISTRADOR CONDICIONAL */}
      {isAdmin && (
        <div style={{ 
          marginBottom: '30px', 
          padding: '15px', 
          backgroundColor: '#ffeaa7', 
          border: '1px solid #fab340',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Acceso de Administrador</p>
          <Link 
            to="/admin/products"
            style={{ 
              display: 'inline-block', 
              marginTop: '10px', 
              padding: '8px 15px', 
              backgroundColor: '#c35555', 
              color: 'white', 
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            ⚙️ Gestionar Productos
          </Link>
        </div>
      )}
      {/* -------------------------------------- */}

      <button 
        onClick={signOut} 
        style={{ 
          backgroundColor: '#dc3545', 
          color: 'white', 
          padding: '10px 15px', 
          borderRadius: '5px',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '30px'
        }}
      >
        Cerrar Sesión
      </button>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.2em' }}>Aún no has realizado ninguna cotización.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: 'var(--shadow-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p><strong>Cotización #{order.id}</strong></p>
              <p>Fecha: {new Date(order.created_at).toLocaleDateString()}</p>
              <p style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#1d4ed8' }}>Total: ${parseFloat(order.total).toFixed(2)}</p>
            </div>
            
            <p>Detalle de productos:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '0.9em' }}>
              {/* Nos aseguramos de que items_json sea un array antes de mapear */}
              {Array.isArray(order.items_json) && order.items_json.map((item, index) => (
                <li key={item.id || index}>{item.name} (x{item.quantity || 1}) - ${(item.price * (item.quantity || 1)).toFixed(2)}</li>
              ))}
            </ul>

            <button 
              onClick={() => generatePDF(order.items_json, order.id, order.created_at, order.total)}
              style={{ 
                marginTop: '15px',
                backgroundColor: 'rgb(195, 85, 85)', 
                color: 'white', 
                padding: '8px 15px', 
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Re-descargar Factura (PDF)
            </button>
          </div>
        ))
      )}
    </div>
  );
};