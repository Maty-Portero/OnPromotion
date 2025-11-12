// src/store/cartStore.js
import { create } from 'zustand';

// Definición de tipos eliminada, ahora es JavaScript estándar

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
}));