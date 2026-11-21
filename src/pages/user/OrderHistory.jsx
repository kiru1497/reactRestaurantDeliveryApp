import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  ShoppingBag,
  Package,
  ArrowRight,
  ArrowLeft,
  Clock,
  MapPin,
  ImageOff,
} from "lucide-react";

import UserNavBar from "../../components/user/UserNavBar";

import { logout } from "../../features/auth/authSlice";
import { fetchCategories } from "../../features/categories/categoriesSlice";
import { fetchRecipes } from "../../features/recipes/recipesSlice";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price || 0));

export default function OrderHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const ordersByUser = useSelector((state) => state.orders.ordersByUser);

  const categories = useSelector((state) => state.categories.items);
  const recipes = useSelector((state) => state.recipes.items);

  // Extract the user ID.
  const userId = user?.uid;

  // Remove duplicate orders based on items and total amount.
  const orders = useMemo(() => {
    if (!userId) return [];

    const userOrders = ordersByUser[userId] || [];

    const seenOrders = new Set();

    // Sort newest orders first.
    const sortedOrders = [...userOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    return sortedOrders.filter((order) => {
      if (!order?.id) {
        return false;
      }

      // Create a signature based on the actual purchased items.
      const orderSignature = JSON.stringify({
        items: (order.items || [])
          .map((item) => ({
            id: item.id,
            name: item.name?.trim().toLowerCase(),
            quantity: Number(item.quantity || 0),
            price: Number(item.price || 0),
          }))
          .sort((a, b) => String(a.id).localeCompare(String(b.id))),

        totalAmount: Number(order.totalAmount || 0),
      });

      // If the same order contents have already been encountered,
      // hide this order.
      if (seenOrders.has(orderSignature)) {
        return false;
      }

      seenOrders.add(orderSignature);
      return true;
    });
  }, [userId, ordersByUser]);

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories and recipes.
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }

    if (recipes.length === 0) {
      dispatch(fetchRecipes());
    }
  }, [dispatch, categories.length, recipes.length]);

  // Search categories and recipes.
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    const matchingCategories = categories
      .filter((category) => category.name?.toLowerCase().includes(query))
      .map((category) => ({ ...category, type: "category" }));

    const matchingRecipes = recipes
      .filter(
        (recipe) =>
          recipe.name?.toLowerCase().includes(query) ||
          recipe.categoryName?.toLowerCase().includes(query) ||
          recipe.ingredients?.some((ingredient) =>
            ingredient.toLowerCase().includes(query),
          ),
      )
      .map((recipe) => ({ ...recipe, type: "recipe" }));

    return [...matchingCategories, ...matchingRecipes];
  }, [searchQuery, categories, recipes]);

  // Navigate when a search result is selected.
  const handleSearchResultClick = (result) => {
    if (result.type === "category") {
      navigate(`/categories/${result.id}/recipes`);
    } else if (result.categoryId) {
      navigate(`/categories/${result.categoryId}/recipes`);
    }
  };

  // Navigate back to shopping.
  const handleBackToShopping = () => {
    navigate("/home");
  };

  // Logout.
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <UserNavBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onResultClick={handleSearchResultClick}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Back to Shopping Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleBackToShopping}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <ArrowLeft size={17} />
            Back to Shopping
          </button>
        </div>

        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <ShoppingBag size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
                Order History
              </h1>

              <p className="mt-1 text-sm text-stone-500">
                Review your previous orders.
              </p>
            </div>
          </div>
        </div>

        {/* Empty order state */}
        {orders.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Package size={30} />
            </div>

            <h2 className="text-lg font-bold text-stone-800">No orders yet</h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-stone-500">
              Your completed orders will appear here after you place your first
              order.
            </p>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Start Shopping
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
              >
                {/* Order header */}
                <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-indigo-700">
                      Order #{order.id}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-stone-500">
                      <span>
                        {(order.items || []).length}{" "}
                        {(order.items || []).length === 1 ? "item" : "items"}
                      </span>

                      <span className="font-semibold text-stone-800">
                        Total: {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                      <Clock size={13} />
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("en-IN")
                        : "Date unavailable"}
                    </div>
                  </div>

                  {/* Order status */}
                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                      order.status === "Delivered"
                        ? "bg-emerald-100 text-emerald-700"
                        : order.status === "Failed" ||
                            order.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>

                {/* Delivery address */}
                <div className="border-b border-stone-100 px-5 py-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-stone-600">
                    <MapPin size={14} />
                    Delivery Address
                  </div>

                  <p className="text-xs leading-5 text-stone-500">
                    {order.deliveryAddress?.street || "Street unavailable"}
                    <br />
                    {order.deliveryAddress?.city || "City unavailable"}
                    {order.deliveryAddress?.zip
                      ? `, ${order.deliveryAddress.zip}`
                      : ""}
                    <br />
                    Phone: {order.deliveryAddress?.phone || "Unavailable"}
                  </p>
                </div>

                {/* Order items */}
                <div className="space-y-3 p-4 sm:p-5">
                  {(order.items || []).map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-400">
                          <ImageOff size={18} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-800">
                          {item.name} × {item.quantity}
                        </p>

                        <p className="mt-1 text-xs text-stone-500">
                          {formatPrice(item.price)} each
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-stone-800">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-stone-200 py-6">
          <p className="text-center text-xs text-stone-400">
            Savora · Made for food lovers
          </p>
        </footer>
      </main>
    </div>
  );
}
