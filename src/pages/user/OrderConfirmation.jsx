import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { CheckCircle2, Package, ArrowRight } from "lucide-react";

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

export default function OrderConfirmation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state) => state.auth.user);
  const categories = useSelector((state) => state.categories.items);
  const recipes = useSelector((state) => state.recipes.items);
  const ordersByUser = useSelector((state) => state.orders.ordersByUser);

  const orderFromNavigation = location.state?.order;

  const latestOrder = useMemo(() => {
    if (orderFromNavigation) return orderFromNavigation;

    if (!user?.uid) return null;

    return ordersByUser[user.uid]?.[0] || null;
  }, [orderFromNavigation, ordersByUser, user]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }

    if (recipes.length === 0) {
      dispatch(fetchRecipes());
    }
  }, [dispatch, categories.length, recipes.length]);

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

  const handleSearchResultClick = (result) => {
    if (result.type === "category") {
      navigate(`/categories/${result.id}/recipes`);
    } else if (result.categoryId) {
      navigate(`/categories/${result.categoryId}/recipes`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  if (!latestOrder) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <UserNavBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onResultClick={handleSearchResultClick}
          onLogout={handleLogout}
        />

        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
            <Package size={40} className="mx-auto text-stone-400" />

            <h1 className="mt-4 text-xl font-bold text-stone-900">
              Order not found
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              We couldn't find the order confirmation.
            </p>

            <button
              onClick={() => navigate("/home")}
              className="mt-6 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Continue Shopping
            </button>
          </div>
        </main>
      </div>
    );
  }

  const address = latestOrder.deliveryAddress;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <UserNavBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onResultClick={handleSearchResultClick}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Success message */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={36} />
          </div>

          <h1 className="mt-4 text-2xl font-extrabold text-stone-900 sm:text-3xl">
            Order Successfully Placed!
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Thank you for ordering with Savora. Your order has been received.
          </p>
        </div>

        {/* Confirmation card */}
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Order Confirmation
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Order #{latestOrder.id}
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
              {latestOrder.status}
            </span>
          </div>

          {/* Order information */}
          <div className="divide-y divide-stone-100">
            <InfoRow
              label="Total Amount"
              value={formatPrice(latestOrder.totalAmount)}
            />

            <InfoRow label="Payment Method" value={latestOrder.paymentMethod} />

            <InfoRow
              label="Order Date"
              value={new Date(latestOrder.createdAt).toLocaleString("en-IN")}
            />

            <InfoRow
              label="Delivery Address"
              value={
                <>
                  {address.street}
                  <br />
                  {address.city}, {address.zip}
                </>
              }
            />

            <InfoRow label="Phone Number" value={address.phone} />

            <InfoRow
              label="Delivery Instructions"
              value={address.instructions || "None"}
            />

            {/* Items */}
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-[120px_1fr]">
              <p className="text-sm font-medium text-stone-500">Items</p>

              <div className="space-y-3">
                {latestOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-800">
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
            </div>
          </div>
        </section>

        {/* Buttons */}
        <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/order-history")}
            className="inline-flex items-center justify-center rounded-xl bg-stone-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            View Order History
          </button>
        </div>

        <footer className="mt-12 border-t border-stone-200 py-6">
          <p className="text-center text-xs text-stone-400">
            Savora · Made for food lovers
          </p>
        </footer>
      </main>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="grid gap-2 px-5 py-4 sm:grid-cols-[120px_1fr] sm:gap-4">
      <p className="text-sm font-medium text-stone-500">{label}</p>

      <div className="text-sm font-medium text-stone-800">{value}</div>
    </div>
  );
}
