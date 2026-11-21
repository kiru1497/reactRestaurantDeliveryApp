import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "savora_cart";

const loadCart = () => {
  try {
    const storedCart = localStorage.getItem(STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error("Unable to load cart:", error);
    return [];
  }
};

const initialState = {
  items: loadCart(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const recipe = action.payload;

      const existingItem = state.items.find((item) => item.id === recipe.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          id: recipe.id,
          name: recipe.name,
          price: Number(recipe.price),
          categoryId: recipe.categoryId,
          categoryName: recipe.categoryName,
          ingredients: recipe.ingredients || [],
          quantity: 1,
        });
      }
    },

    increaseQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload);

      if (item) {
        item.quantity += 1;
      }
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload);

      if (!item) return;

      item.quantity -= 1;

      if (item.quantity < 1) {
        state.items = state.items.filter(
          (cartItem) => cartItem.id !== action.payload,
        );
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
