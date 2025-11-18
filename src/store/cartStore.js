// src/store/cartStore.js (ACTUALIZADO)
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // AÑADIR PRODUCTOS (SIN CAMBIOS)
      addToCart: (product) => {
        // ... (Tu lógica existente para añadir o incrementar) ...
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

      // 🚩 NUEVA FUNCIÓN: Decrementa la cantidad o elimina el producto
      decrementQuantity: (itemId) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === itemId);

          if (!existingItem) return state; // No existe el ítem

          if (existingItem.quantity > 1) {
            // Caso 1: Decrementar la cantidad
            return {
              items: state.items.map(item =>
                item.id === itemId
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              ),
            };
          } else {
            // Caso 2: Eliminar el producto si la cantidad es 1
            return {
              items: state.items.filter(item => item.id !== itemId),
            };
          }
        });
      },

      // ELIMINAR COMPLETAMENTE (SIN CAMBIOS)
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
      name: 'shopping-cart-storage',
      getStorage: () => localStorage,
    }
  )
);