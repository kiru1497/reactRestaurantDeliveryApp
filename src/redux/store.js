import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import categoriesReducer from "../features/categories/categoriesSlice";
import recipesReducer from "../features/recipes/recipesSlice";
import cartReducer from "../features/cart/cartSlice";
import ordersReducer from "../features/orders/ordersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    recipes: recipesReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
});

// Persist cart
store.subscribe(() => {
  try {
    localStorage.setItem(
      "savora_cart",
      JSON.stringify(store.getState().cart.items),
    );
  } catch (error) {
    console.error("Unable to persist cart:", error);
  }
});

// Persist orders
store.subscribe(() => {
  try {
    localStorage.setItem(
      "savora_orders",
      JSON.stringify(store.getState().orders.ordersByUser),
    );
  } catch (error) {
    console.error("Unable to persist orders:", error);
  }
});
