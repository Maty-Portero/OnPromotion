// src/pages/Account.jsx
import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient'; 

// Componente principal
// ¡SOLO DEBE HABER ESTA DECLARACIÓN DE ACCOUNT EN ESTE ARCHIVO!
export const Account = () => {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Función para descargar el PDF (Definida dentro de Account)
  const generatePDF = async (orderItems) => {
    // Lógica para crear el recibo temporal en el DOM
    const tempReceipt = document.createElement('div');
    tempReceipt.style.padding = '20px';
    tempReceipt.style.backgroundColor = '#ffffff';
    tempReceipt.style.color = '#000000';
    tempReceipt.style.maxWidth = '600px';

    let total = 0;
    let itemsHtml = '';
    
    orderItems.forEach(item => {
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      const itemTotal = price * quantity;
      total += itemTotal;
      itemsHtml += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>${item.name} (x${quantity})</span>
          <span>$${itemTotal.toFixed(2)}</span>
        </div>
      `;
    });

    tempReceipt.innerHTML = `
      <h2>Factura de OnPromotion - Re-descarga</h2>
      <p>Fecha de Orden: ${new Date().toLocaleDateString()}</p>
      <hr style="border-color: #000000;"/>
      ${itemsHtml}
      <hr style="border-color: #000000;"/>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2em;">
        <span>TOTAL PAGADO:</span>
        <span>$${total.toFixed(2)}</span>
      </div>
    `;
    
    document.body.appendChild(tempReceipt);

    // Captura con html2canvas
    const canvas = await html2canvas(tempReceipt, { scale: 2, useCORS: true });
    document.body.removeChild(tempReceipt); 

    // LÓGICA DE PDF SIMPLIFICADA
    const imgData = canvas.toDataURL('image/jpeg', 1.0); 
    const imgWidth = 200; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4'); 
    pdf.addImage(imgData, 'JPEG', 5, 5, imgWidth, imgHeight); 
    
    pdf.save(`recibo-re-descarga-${new Date().getTime()}.pdf`);
  };


  useEffect(() => {
    if (user) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    setDataLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id) 
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar órdenes:', error);
      setOrders([]);
    } else {
      setOrders(data.map(order => ({
        ...order,
        items_json: Array.isArray(order.items_json) ? order.items_json : [] 
      })));
    }
    setDataLoading(false);
  };

  if (loading || dataLoading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando historial de compras...</h2>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1>Mi Cuenta: Historial de Compras</h1>
      
      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.2em' }}>Aún no has realizado ninguna compra.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: 'var(--shadow-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p><strong>Orden #{order.id}</strong></p>
              <p>Fecha: {new Date(order.created_at).toLocaleDateString()}</p>
              <p style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#1d4ed8' }}>Total: ${parseFloat(order.total).toFixed(2)}</p>
            </div>
            
            <p>Detalle de productos:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '0.9em' }}>
              {order.items_json.map((item, index) => (
                <li key={item.id || index}>{item.name} (x{item.quantity}) - ${(item.price * item.quantity).toFixed(2)}</li>
              ))}
            </ul>

            <button 
              onClick={() => generatePDF(order.items_json)}
              style={{ marginTop: '10px', backgroundColor: '#10b981' }}
            >
              Descargar Recibo (PDF)
            </button>
          </div>
        ))
      )}
    </div>
  );
};