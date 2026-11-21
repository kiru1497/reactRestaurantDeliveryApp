import { createSlice } from "@reduxjs/toolkit";

const DUPLICATE_WINDOW = 30 * 60 * 1000; // 30 minutes

const getOrderSignature = (order) => {
  return JSON.stringify({
    items: [...(order.items || [])]
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price || 0),
      }))
      .sort((a, b) => String(a.id).localeCompare(String(b.id))),

    totalAmount: Number(order.totalAmount || 0),

    deliveryAddress: {
      street: order.deliveryAddress?.street?.trim().toLowerCase(),
      city: order.deliveryAddress?.city?.trim().toLowerCase(),
      zip: order.deliveryAddress?.zip?.trim(),
      phone: order.deliveryAddress?.phone?.trim(),
    },
  });
};

const removeDuplicateOrders = (orders) => {
  const uniqueOrders = [];
  const seenOrderIds = new Set();
  const seenOrderSignatures = new Map();

  const sortedOrders = [...(Array.isArray(orders) ? orders : [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  sortedOrders.forEach((order) => {
    if (!order?.id || seenOrderIds.has(order.id)) {
      return;
    }

    seenOrderIds.add(order.id);

    const signature = getOrderSignature(order);
    const orderTime = new Date(order.createdAt).getTime();

    const previousTime = seenOrderSignatures.get(signature);

    // Ignore identical orders placed within 30 minutes.
    if (
      previousTime !== undefined &&
      Math.abs(previousTime - orderTime) <= DUPLICATE_WINDOW
    ) {
      return;
    }

    seenOrderSignatures.set(signature, orderTime);
    uniqueOrders.push(order);
  });

  return uniqueOrders;
};

const getStoredOrders = () => {
  try {
    const storedOrders = JSON.parse(
      localStorage.getItem("savora_orders") || "{}",
    );

    const cleanedOrders = {};

    Object.entries(storedOrders).forEach(([userId, orders]) => {
      cleanedOrders[userId] = removeDuplicateOrders(orders);
    });

    return cleanedOrders;
  } catch (error) {
    console.error("Unable to load orders:", error);
    return {};
  }
};

const initialState = {
  ordersByUser: getStoredOrders(),
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,

  reducers: {
    placeOrder: (state, action) => {
      const { userId, order } = action.payload;

      if (!userId || !order?.id) {
        return;
      }

      if (!state.ordersByUser[userId]) {
        state.ordersByUser[userId] = [];
      }

      const userOrders = state.ordersByUser[userId];

      // Prevent an identical order from being placed again
      // within the duplicate protection window.
      const newSignature = getOrderSignature(order);
      const newOrderTime = new Date(order.createdAt).getTime();

      const duplicateExists = userOrders.some((existingOrder) => {
        if (existingOrder.id === order.id) {
          return true;
        }

        if (getOrderSignature(existingOrder) !== newSignature) {
          return false;
        }

        const existingOrderTime = new Date(existingOrder.createdAt).getTime();

        return Math.abs(existingOrderTime - newOrderTime) <= DUPLICATE_WINDOW;
      });

      if (duplicateExists) {
        return;
      }

      userOrders.unshift(order);
    },

    // Update an order's status without replacing the rest of its data.
    updateOrderStatus: (state, action) => {
      const { userId, orderId, status } = action.payload;

      if (!userId || !orderId || !status) {
        return;
      }

      const userOrders = state.ordersByUser[userId];

      if (!userOrders) {
        return;
      }

      const order = userOrders.find(
        (item) => String(item.id) === String(orderId),
      );

      if (order) {
        order.status = status;
      }
    },
  },
});

export const { placeOrder, updateOrderStatus } = ordersSlice.actions;

export default ordersSlice.reducer;
