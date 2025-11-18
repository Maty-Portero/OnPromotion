// src/pages/Checkout.jsx
import React, { useRef, useState } from 'react'; // AÑADIDO useState
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom'; // AÑADIDO useNavigate
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient'; 

// Importa tu archivo de logo (AJUSTA ESTA RUTA si es necesario)
import OnPromotionLogo from '../assets/onpromotion_logo.jpg'; 

export const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const receiptRef = useRef(null); 
  const navigate = useNavigate(); // Obtener la función navigate
  
  // Usaremos un estado para almacenar el ID de la orden una vez guardada
  const [currentOrderId, setCurrentOrderId] = useState(null); 

  const totalAmountRaw = getCartTotal();
  const totalAmount = parseFloat(totalAmountRaw) || 0; 
  const finalTotalForDisplay = totalAmount.toFixed(2);

  const generatePDF = async () => {
    if (!receiptRef.current || !user) return;

    try {
        // --- PASO 1: GUARDAR LA ORDEN EN SUPABASE ---
        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: user.id, 
                    total: totalAmount, 
                    items_json: items, 
                },
            ])
            .select();

        if (error) throw error;
        
        // Obtener el ID de la nueva orden
        const orderId = data[0].id; 
        
        // ACTULIZAR EL ESTADO (Para que el recibo HTML se re-renderice con el ID)
        setCurrentOrderId(orderId); 

        // PAUSAR UN MOMENTO (50ms) para que el DOM se actualice con el nuevo ID antes de capturar
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        // --- PASO 2: GENERAR EL PDF ---
        const canvas = await html2canvas(receiptRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4'); 
        const imgWidth = 200; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight); 
        pdf.save(`recibo-onpromotion-orden-${orderId}.pdf`);
        
        // --- PASO 3: Limpiar carrito y Redirigir ---
        clearCart(); 
        alert(`¡Compra finalizada con éxito! Recibo #${orderId} generado.`);
        navigate('/'); // Redirige al productList

    } catch (err) {
        console.error("Error al procesar la compra o guardar la orden:", err);
        alert(`Hubo un error al procesar tu compra. Error: ${err.message}. Por favor, verifica las políticas RLS en la tabla 'orders'.`);
        // Si falla, limpiar el ID temporal
        setCurrentOrderId(null); 
    }
  };
  
  // Condición de seguridad y UX
  if (items.length === 0 || !user) {
      return (
        <h2 style={{ textAlign: 'center', marginTop: '50px' }}>
          Debes estar logueado y tener productos en el carrito para pagar.
        </h2>
      );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Finalizar Compra</h1>
      
      {/* Contenedor que será capturado por html2canvas para el PDF */}
      <div 
        ref={receiptRef} 
        style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          padding: '30px', 
          border: '1px solid #000', 
          backgroundColor: '#f9f9f9',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        
        {/* CABECERA Y LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
            <img 
                src={OnPromotionLogo}
                alt="Logo OnPromotion" 
                style={{ height: '50px', display: 'block', margin: '0 auto' }}
            />
            <h2 style={{ color: '#c35555', margin: '5px 0 0' }}>REMITO</h2>
            <p style={{ fontSize: '0.8em', margin: 0 }}>Razón Social: OnPromotion S.A. | cuit: XXXXXX</p>
        </div>
        
        {/* Detalles de la Orden: USAMOS EL NUEVO ESTADO */}
        <p style={{ fontWeight: 'bold' }}>Orden ID: #{currentOrderId || 'PENDIENTE'}</p>
        <p>Cliente: {user.email}</p>
        <p>Fecha: {new Date().toLocaleDateString()}</p>
        
        <hr style={{ margin: '20px 0', borderColor: '#ccc' }}/>

        {/* Lista de Productos (TABLA HTML) */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
                <tr style={{ backgroundColor: '#e0e0e0' }}>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>Producto</th>
                    <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>Cant.</th>
                    <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={item.id}>
                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>{item.name}</td>
                        <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>{item.quantity}</td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ccc' }}>${(item.price * (item.quantity || 1)).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {/* Totales */}
        <div style={{ textAlign: 'right', marginTop: '30px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.5em', color: '#c35555', margin: 0 }}>TOTAL PAGADO: ${finalTotalForDisplay}</p>
        </div>

        {/* PIE DE PÁGINA Y MENSAJE */}
        <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '15px', borderTop: '1px solid #ccc' }}>
            <p style={{ fontStyle: 'italic', color: '#666', margin: 0 }}>
                ¡Gracias por tu compra! Tu satisfacción es nuestra prioridad.
            </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={generatePDF}
          style={{ 
            backgroundColor: '#0FA0CE', 
            color: 'white', 
            padding: '15px 30px', 
            fontSize: '1.3em',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Pagar y Descargar Remito
        </button>
      </div>
    </div>
  );
};