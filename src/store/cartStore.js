// src/store/cartStore.js (VERSIÓN COMPLETA Y CORREGIDA)
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 🚩 1. IMPORTAR PERSIST

export const useCartStore = create(
  persist( // 🚩 2. ENVOLVER CON PERSIST PARA EVITAR QUE SE BORRE AL RECARGAR
    (set, get) => ({
      items: [],

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);

          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return {
              items: [...state.items, { ...product, quantity: 1 }],
            };
          }
        });
      },

      // 🚩 NUEVA FUNCIÓN: Permite establecer la cantidad directamente (para el input)
      setQuantity: (itemId, quantity) => {
        // Aseguramos que la cantidad es un entero y al menos 1
        const newQuantity = Math.max(1, parseInt(quantity) || 1); 

        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity: newQuantity }
              : item
          ).filter(item => item.quantity > 0), 
        }));
      },

      // 🚩 NUEVA FUNCIÓN: Decrementa la cantidad o elimina el producto (para el botón '-')
      decrementQuantity: (itemId) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === itemId);

          if (!existingItem) return state;

          if (existingItem.quantity > 1) {
            return {
              items: state.items.map(item =>
                item.id === itemId
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              ),
            };
          } else {
            // Eliminar el producto si la cantidad es 1
            return {
              items: state.items.filter(item => item.id !== itemId),
            };
          }
        });
      },

      removeFromCart: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        const total = get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        return total.toFixed(2);
      },
    }),
    {
      name: 'shopping-cart-storage', // Clave en localStorage
      getStorage: () => localStorage, 
    }
  ) 
);