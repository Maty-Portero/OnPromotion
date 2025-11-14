// src/pages/Account.jsx (CORREGIDO)
import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';

export const Account = () => { // <--- EL COMPONENTE SE EXPORTA CORRECTAMENTE
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // 🚩 FUNCIÓN MOVIDA DENTRO DEL COMPONENTE (Soluciona el problema de SyntaxError/Blank Page)
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
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #c35555; margin: 0;">OnPromotion</h2>
        <p style="font-size: 0.8em; margin: 5px 0 0;">FACTURA DE VENTA - RE-DESCARGA</p>
      </div>

      <p style="font-weight: bold;">Cliente: ${user.email}</p>
      <p>Fecha de Orden: ${new Date().toLocaleDateString()}</p>
      <hr style="border-color: #000000; margin: 15px 0;"/>
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #e0e0e0;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ccc;">Producto</th>
            <th style="padding: 8px; text-align: center; border: 1px solid #ccc;">Cant.</th>
            <th style="padding: 8px; text-align: right; border: 1px solid #ccc;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems.map(item => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;">${item.name}</td>
              <td style="padding: 8px; text-align: center; border: 1px solid #ccc;">${item.quantity || 1}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ccc;">$${(item.price * (item.quantity || 1)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px;">
        <p style="font-weight: bold; font-size: 1.5em; color: #c35555; margin: 0;">TOTAL PAGADO: $${total.toFixed(2)}</p>
      </div>

      <div style="text-align: center; margin-top: 40px; padding-top: 10px; border-top: 1px solid #ccc;">
        <p style="font-style: italic; color: #666; margin: 0;">
            ¡Gracias por preferirnos! Re-descarga exitosa.
        </p>
      </div>
    `;

    document.body.appendChild(tempReceipt);

    // Captura con html2canvas
    const canvas = await html2canvas(tempReceipt, { scale: 2, useCORS: true });
    document.body.removeChild(tempReceipt);

    // --- LÓGICA DE PDF SIMPLIFICADA (Elimina el bucle while inestable) ---
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgWidth = 200;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'JPEG', 5, 5, imgWidth, imgHeight);

    pdf.save(`recibo-re-descarga-${new Date().getTime()}.pdf`);
  };
  // -----------------------------------------------------------------------


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
      // Asegurar que items_json sea un array si está vacío
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
              {/* Nos aseguramos de que order.items_json es un array antes de mapear */}
              {Array.isArray(order.items_json) && order.items_json.map((item, index) => (
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