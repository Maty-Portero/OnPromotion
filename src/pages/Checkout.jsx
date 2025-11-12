// src/pages/Checkout.jsx
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../context/AuthContext'; 
import { supabase } from '../supabase/supabaseClient'; 

export const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const receiptRef = useRef(null); 
  
  // CORRECCIÓN CRÍTICA: Nos aseguramos de que el total sea un número flotante o 0
  const totalAmountRaw = getCartTotal();
  const totalAmount = parseFloat(totalAmountRaw) || 0; 
  
  // Usamos el total ya verificado y formateado
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
        
        const orderId = data[0].id; 

        // --- PASO 2: GENERAR EL PDF (Lógica Súper-Robusta) ---
        const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true }); 

        const imgData = canvas.toDataURL('image/jpeg', 1.0); 
        const imgWidth = 200; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'a4'); 

        pdf.addImage(imgData, 'JPEG', 5, 5, imgWidth, imgHeight); 

        pdf.save(`recibo-onpromotion-${orderId}-${new Date().getTime()}.pdf`);
        
        // --- PASO 3: Limpiar carrito ---
        clearCart(); 

    } catch (err) {
        console.error("Error al procesar la compra o guardar la orden:", err);
        alert(`Hubo un error al procesar tu compra. Error: ${err.message}. POR FAVOR, VERIFICA RLS.`);
    }
  };
  
  if (items.length === 0 || !user) {
      return <h2>Debes estar logueado y tener productos en el carrito para pagar.</h2>;
  }

  return (
    <div>
      <h1>Finalizar Compra</h1>
      
      <div ref={receiptRef} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #eee', backgroundColor: '#fff' }}>
        <h2>Recibo de Compra</h2>
        
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} (x{item.quantity}) - ${(item.price * (item.quantity || 1)).toFixed(2)}
            </li>
          ))}
        </ul>
        <hr />
        {/* Usamos el valor ya formateado (finalTotalForDisplay) */}
        <p style={{ fontWeight: 'bold' }}>Total: ${finalTotalForDisplay}</p> 
      </div>

      <button onClick={generatePDF} className="pdf-button">
        Generar Recibo en PDF y Finalizar
      </button>
    </div>
  );
};