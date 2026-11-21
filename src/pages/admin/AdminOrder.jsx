import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ShoppingBag, Package, Clock, MapPin, ImageOff } from "lucide-react";

import { updateOrderStatus } from "../../features/orders/ordersSlice";

const STATUS_OPTIONS = ["Pending", "Delivered", "Failed"];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price || 0));

const getStatusStyles = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-emerald-100 text-emerald-700";

    case "Failed":
      return "bg-red-100 text-red-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
};

export default function AdminOrder() {
  const dispatch = useDispatch();

  const ordersByUser = useSelector((state) => state.orders.ordersByUser);

  // Collect orders from every user.
  // Sort newest orders first and remove duplicate order IDs.
  const orders = useMemo(() => {
    const allOrders = Object.entries(ordersByUser || {}).flatMap(
      ([userId, userOrders]) =>
        (Array.isArray(userOrders) ? userOrders : []).map((order) => ({
          ...order,
          userId,
        })),
    );

    const seenOrderIds = new Set();

    return allOrders
      .filter((order) => {
        if (!order?.id) {
          return false;
        }

        const uniqueKey = `${order.userId}-${order.id}`;

        if (seenOrderIds.has(uniqueKey)) {
          return false;
        }

        seenOrderIds.add(uniqueKey);
        return true;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [ordersByUser]);

  // Calculate pending orders dynamically.
  // Orders without a valid status are treated as Pending.
  const pendingOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = STATUS_OPTIONS.includes(order.status)
        ? order.status
        : "Pending";

      return status === "Pending";
    }).length;
  }, [orders]);

  const handleStatusChange = (userId, orderId, status) => {
    if (!STATUS_OPTIONS.includes(status)) {
      return;
    }

    dispatch(
      updateOrderStatus({
        userId,
        orderId,
        status,
      }),
    );
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <ShoppingBag size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage customer orders.
            </p>
          </div>
        </div>
      </div>

      {/* Order statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Total Orders */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Package size={21} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Total Orders</p>

            <p className="mt-0.5 text-2xl font-bold text-slate-900">
              {orders.length}
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock size={21} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Pending Orders</p>

            <p className="mt-0.5 text-2xl font-bold text-slate-900">
              {pendingOrders}
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Package size={28} />
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            No orders found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Customer orders will appear here when they are placed.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const currentStatus = STATUS_OPTIONS.includes(order.status)
              ? order.status
              : "Pending";

            const address = order.deliveryAddress || {};

            return (
              <article
                key={`${order.userId}-${order.id}`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Order header */}
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-indigo-700">
                      Order #{order.id}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>
                        {(order.items || []).length}{" "}
                        {(order.items || []).length === 1 ? "item" : "items"}
                      </span>

                      <span className="font-semibold text-slate-800">
                        Total: {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock size={13} />

                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("en-IN")
                        : "Date unavailable"}
                    </div>
                  </div>

                  {/* Editable status */}
                  <div className="flex flex-col gap-2 sm:items-end">
                    <label
                      htmlFor={`status-${order.userId}-${order.id}`}
                      className="text-xs font-semibold text-slate-500"
                    >
                      Order Status
                    </label>

                    <select
                      id={`status-${order.userId}-${order.id}`}
                      value={currentStatus}
                      onChange={(e) =>
                        handleStatusChange(
                          order.userId,
                          order.id,
                          e.target.value,
                        )
                      }
                      className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-40 ${getStatusStyles(
                        currentStatus,
                      )}`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery address */}
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <MapPin size={14} />
                    Delivery Address
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    {address.street || "Street unavailable"}
                    <br />
                    {address.city || "City unavailable"}
                    {address.zip ? `, ${address.zip}` : ""}
                    <br />
                    Phone: {address.phone || "Unavailable"}
                  </p>
                </div>

                {/* Order items */}
                <div className="space-y-3 p-4 sm:p-5">
                  {(order.items || []).map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name || "Order item"}
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                          <ImageOff size={18} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {item.name || "Unnamed item"} × {item.quantity || 0}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatPrice(item.price)} each
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-slate-800">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
