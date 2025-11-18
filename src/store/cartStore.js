// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 1. IMPORTAR PERSIST

// Definición de tipos eliminada, ahora es JavaScript estándar

// 2. ENVOLVER create CON persist
export const useCartStore = create(
  persist(
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
    // 3. OPCIONES DE CONFIGURACIÓN DEL PERSIST
    {
      name: 'shopping-cart-storage', // Nombre clave en localStorage
      getStorage: () => localStorage, // Indica que use localStorage
      // Opcional: whitelist o blacklist de estados
      // whitelist: ['items'], 
    }
  ) // Cierre del persist
); // Cierre del create