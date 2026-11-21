import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import categoriesReducer from "../features/categories/categoriesSlice";
import recipesReducer from "../features/recipes/recipesSlice";
import cartReducer from "../features/cart/cartSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    recipes: recipesReducer,
    cart: cartReducer,
  },
});

// Persist cart changes without putting storage operations inside reducers.
store.subscribe(() => {
  try {
    const cart = store.getState().cart.items;

    localStorage.setItem("savora_cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Unable to persist cart:", error);
  }
});

export { store };
