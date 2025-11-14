// src/pages/Checkout.jsx (VERSION FINAL CORREGIDA)
import React, { useRef, useState } from 'react'; // 🚩 AÑADIMOS useState
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient'; 

// Asegúrate de que esta ruta de logo es correcta:
import OnPromotionLogo from '../assets/onpromotion_logo.jpg'; 

export const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const receiptRef = useRef(null); 
  
  // Usaremos un estado para almacenar el ID de la orden una vez guardada
  const [currentOrderId, setCurrentOrderId] = useState(null); // 🚩 NUEVO ESTADO

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
        
        // 🚩 ACTULIZAR EL ESTADO (Para que el recibo HTML se re-renderice con el ID)
        setCurrentOrderId(orderId); 

        // PAUSAR UN MOMENTO para que el DOM se actualice con el nuevo ID antes de capturar
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        // --- PASO 2: GENERAR EL PDF ---
        const canvas = await html2canvas(receiptRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); 
        const imgWidth = 200; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight); 
        pdf.save(`recibo-onpromotion-${orderId}-${new Date().getTime()}.pdf`);
        
        // --- PASO 3: Limpiar carrito ---
        clearCart(); 

    } catch (err) {
        console.error("Error al procesar la compra o guardar la orden:", err);
        alert(`Hubo un error al procesar tu compra. Error: ${err.message}. POR FAVOR, VERIFICA RLS.`);
        // Si falla, limpiar el ID temporal
        setCurrentOrderId(null); 
    }
  };
  
  if (items.length === 0 || !user) {
      return <h2>Debes estar logueado y tener productos en el carrito para pagar.</h2>;
  }

  return (
    <div>
        <h1>Finalizar Compra</h1>
        
        {/* Usamos el estado currentOrderId aquí */}
        <div ref={receiptRef} style={{ maxWidth: '600px', margin: '0 auto', padding: '30px', border: '1px solid #000', backgroundColor: '#f9f9f9' }}>
            
            {/* CABECERA Y LOGO */}
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                <img 
                    src={OnPromotionLogo}
                    alt="Logo OnPromotion" 
                    style={{ height: '50px', display: 'block', margin: '0 auto' }}
                />
                <h2 style={{ color: '#c35555', margin: '5px 0 0' }}>FACTURA DE VENTA</h2>
                <p style={{ fontSize: '0.8em', margin: 0 }}>Razón Social: OnPromotion S.A. | RUC: XXXXXX</p>
            </div>
            
            {/* Detalles de la Orden: USAMOS EL NUEVO ESTADO */}
            <p style={{ fontWeight: 'bold' }}>Orden ID: #{currentOrderId || 'PENDIENTE'}</p>
            <p>Cliente: {user.email}</p>
            <p>Fecha: {new Date().toLocaleDateString()}</p>
            
            <hr style={{ margin: '20px 0', borderColor: '#ccc' }}/>

            {/* Lista de Productos */}
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
                <p style={{ fontWeight: 'bold', fontSize: '1.5em', color: '#c35555' }}>TOTAL PAGADO: ${finalTotalForDisplay}</p>
            </div>

            {/* PIE DE PÁGINA Y MENSAJE */}
            <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '15px', borderTop: '1px solid #ccc' }}>
                <p style={{ fontStyle: 'italic', color: '#666' }}>
                    ¡Gracias por tu compra! Tu satisfacción es nuestra prioridad.
                </p>
                <p style={{ fontSize: '0.7em', margin: 0 }}>
                    Este es un comprobante digital, válido como recibo.
                </p>
            </div>
        </div>

        <button onClick={generatePDF} style={{ marginTop: '20px' }}>
            Pagar y Descargar Recibo
        </button>
    </div>
  );
};