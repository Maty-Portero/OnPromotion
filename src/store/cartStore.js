// src/store/cartStore.js (CORREGIDO)
import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
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

  // 🚩 NUEVA FUNCIÓN: Disminuye la cantidad en 1 unidad
  decreaseQuantity: (itemId) => {
    set((state) => ({
      items: state.items.flatMap(item => {
        if (item.id === itemId) {
          // Si la cantidad es mayor a 1, la reducimos
          if (item.quantity > 1) {
            return [{ ...item, quantity: item.quantity - 1 }];
          } else {
            // Si la cantidad es 1, la eliminamos completamente del carrito (comportamiento por defecto de "Eliminar")
            return []; 
          }
        }
        return [item];
      }),
    }));
  },

  // Función para eliminar todo el tipo de producto (por si la necesitas más tarde)
  removeItemType: (itemId) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== itemId),
    }));
  },

  clearCart: () => set({ items: [] }),

  getCartTotal: () => {
    const total = get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    // Devolvemos el número sin toFixed(2) para que el componente CartPage.jsx lo maneje
    return total; 
  },
}));