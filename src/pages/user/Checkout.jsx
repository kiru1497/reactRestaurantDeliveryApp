import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  LoaderCircle,
  ImageOff,
  CheckCircle,
} from "lucide-react";

import UserNavBar from "../../components/user/UserNavBar";

import { logout } from "../../features/auth/authSlice";
import { clearCart } from "../../features/cart/cartSlice";
import { placeOrder } from "../../features/orders/ordersSlice";

import { fetchCategories } from "../../features/categories/categoriesSlice";
import { fetchRecipes } from "../../features/recipes/recipesSlice";

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

const EMPTY_ARRAY = [];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price || 0));

const initialAddress = {
  street: "",
  city: "",
  zip: "",
  phone: "",
  instructions: "",
};

/* --------------------------------------------------
   CHECKOUT COMPONENT
-------------------------------------------------- */

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.items || EMPTY_ARRAY);

  const user = useSelector((state) => state.auth.user);

  const categoriesState = useSelector((state) => state.categories);
  const recipesState = useSelector((state) => state.recipes);

  const categories = categoriesState?.items ?? EMPTY_ARRAY;
  const recipes = recipesState?.items ?? EMPTY_ARRAY;

  const categoriesStatus = categoriesState?.status;
  const recipesStatus = recipesState?.status;

  const [address, setAddress] = useState(initialAddress);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Prevent multiple order submissions before React re-renders
  const submissionLock = useRef(false);

  /* --------------------------------------------------
     FETCH CATEGORIES AND RECIPES
  -------------------------------------------------- */

  useEffect(() => {
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }

    if (recipesStatus === "idle") {
      dispatch(fetchRecipes());
    }
  }, [dispatch, categoriesStatus, recipesStatus]);

  /* --------------------------------------------------
     SEARCH
  -------------------------------------------------- */

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    const categoryResults = categories
      .filter((category) => (category.name || "").toLowerCase().includes(query))
      .map((category) => ({
        ...category,
        type: "category",
      }));

    const recipeResults = recipes
      .filter((recipe) => {
        const name = (recipe.name || "").toLowerCase();
        const categoryName = (recipe.categoryName || "").toLowerCase();

        const ingredients = Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : [];

        return (
          name.includes(query) ||
          categoryName.includes(query) ||
          ingredients.some((ingredient) =>
            String(ingredient).toLowerCase().includes(query),
          )
        );
      })
      .map((recipe) => ({
        ...recipe,
        type: "recipe",
      }));

    return [...categoryResults, ...recipeResults];
  }, [searchQuery, categories, recipes]);

  /* --------------------------------------------------
     CART TOTAL
  -------------------------------------------------- */

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [cartItems]);

  /* --------------------------------------------------
     SEARCH NAVIGATION
  -------------------------------------------------- */

  const handleSearchResultClick = (result) => {
    if (result.type === "category") {
      navigate(`/categories/${result.id}/recipes`);
      return;
    }

    if (result.type === "recipe" && result.categoryId) {
      navigate(`/categories/${result.categoryId}/recipes`);
    }
  };

  /* --------------------------------------------------
     LOGOUT
  -------------------------------------------------- */

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  /* --------------------------------------------------
     ADDRESS INPUT HANDLING
  -------------------------------------------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  /* --------------------------------------------------
     VALIDATION
  -------------------------------------------------- */

  const validate = () => {
    const newErrors = {};

    if (!address.street.trim()) {
      newErrors.street = "Street address is required.";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!/^\d{6}$/.test(address.zip.trim())) {
      newErrors.zip = "Enter a valid 6-digit PIN code.";
    }

    if (!/^\d{10}$/.test(address.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* --------------------------------------------------
     PLACE ORDER
  -------------------------------------------------- */

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    // Prevent rapid repeated submissions
    if (submissionLock.current) {
      return;
    }

    if (!validate()) {
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    if (!user?.uid) {
      navigate("/login", { replace: true });
      return;
    }

    // Lock immediately, before React re-renders
    submissionLock.current = true;
    setSubmitting(true);

    try {
      const order = {
        id: `ORD-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)
          .toUpperCase()}`,

        userId: user.uid,

        status: "Pending",

        paymentMethod: "Cash on Delivery",

        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          categoryName: item.categoryName || "",
          imageUrl: item.imageUrl || "",
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 0),
          subtotal: Number(item.price || 0) * Number(item.quantity || 0),
        })),

        totalAmount: cartTotal,

        deliveryAddress: {
          street: address.street.trim(),
          city: address.city.trim(),
          zip: address.zip.trim(),
          phone: address.phone.trim(),
          instructions: address.instructions.trim(),
        },

        createdAt: new Date().toISOString(),
      };

      // Save the order only once
      dispatch(
        placeOrder({
          userId: user.uid,
          order,
        }),
      );

      // Clear the cart after placing the order
      dispatch(clearCart());

      // Navigate to the confirmation page
      navigate("/order-confirmation", {
        replace: true,
        state: { order },
      });
    } catch (error) {
      console.error("Unable to place order:", error);

      // Unlock submission if something fails
      submissionLock.current = false;

      alert(
        typeof error === "string"
          ? error
          : "Unable to place your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <UserNavBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onResultClick={handleSearchResultClick}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        {/* BACK TO CART */}

        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </button>

        {/* PAGE TITLE */}

        <div className="mb-7">
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Review your order and enter your delivery details.
          </p>
        </div>

        {/* EMPTY CART */}

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
            <ShoppingBag size={36} className="mx-auto text-stone-400" />

            <h2 className="mt-4 text-lg font-bold text-stone-800">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Add some delicious items before proceeding to checkout.
            </p>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="mt-5 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* ORDER SUMMARY */}

            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-orange-600" />

                  <h2 className="font-bold text-stone-900">Order Summary</h2>
                </div>
              </div>

              <div className="divide-y divide-stone-100">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-4 sm:px-5"
                  >
                    {/* IMAGE */}

                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
                        <ImageOff size={20} />
                      </div>
                    )}

                    {/* DETAILS */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-800">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        {formatPrice(item.price)} each
                      </p>
                    </div>

                    {/* ITEM SUBTOTAL */}

                    <p className="shrink-0 text-sm font-semibold text-stone-800">
                      {formatPrice(
                        Number(item.price || 0) * Number(item.quantity || 0),
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* TOTAL */}

              <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-5 py-4">
                <span className="font-semibold text-stone-800">Total</span>

                <span className="text-lg font-extrabold text-stone-900">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </section>

            {/* DELIVERY ADDRESS */}

            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <MapPin size={19} className="text-orange-600" />

                <h2 className="font-bold text-stone-900">Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* STREET */}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Street Address *
                  </label>

                  <input
                    name="street"
                    value={address.street}
                    onChange={handleChange}
                    placeholder="House number, street, area"
                    className={`w-full rounded-lg border px-3 py-3 text-sm outline-none transition ${
                      errors.street
                        ? "border-red-300 focus:ring-2 focus:ring-red-100"
                        : "border-stone-200 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                  {errors.street && (
                    <p className="mt-1 text-xs text-red-600">{errors.street}</p>
                  )}
                </div>

                {/* CITY */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    City *
                  </label>

                  <input
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`w-full rounded-lg border px-3 py-3 text-sm outline-none transition ${
                      errors.city
                        ? "border-red-300 focus:ring-2 focus:ring-red-100"
                        : "border-stone-200 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                  )}
                </div>

                {/* ZIP / PIN */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    ZIP Code / PIN Code *
                  </label>

                  <input
                    name="zip"
                    value={address.zip}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit PIN code"
                    className={`w-full rounded-lg border px-3 py-3 text-sm outline-none transition ${
                      errors.zip
                        ? "border-red-300 focus:ring-2 focus:ring-red-100"
                        : "border-stone-200 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                  {errors.zip && (
                    <p className="mt-1 text-xs text-red-600">{errors.zip}</p>
                  )}
                </div>

                {/* PHONE */}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Phone Number *
                  </label>

                  <input
                    name="phone"
                    value={address.phone}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className={`w-full rounded-lg border px-3 py-3 text-sm outline-none transition ${
                      errors.phone
                        ? "border-red-300 focus:ring-2 focus:ring-red-100"
                        : "border-stone-200 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    }`}
                  />

                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* DELIVERY INSTRUCTIONS */}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Delivery Instructions (Optional)
                  </label>

                  <textarea
                    name="instructions"
                    value={address.instructions}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any instructions for the delivery person..."
                    className="w-full resize-y rounded-lg border border-stone-200 px-3 py-3 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>
            </section>

            {/* PLACE ORDER */}

            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-stone-500">
                  Pay on delivery
                </span>

                <span className="font-bold text-stone-800">
                  Cash on Delivery
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Place Order
                  </>
                )}
              </button>
            </section>
          </form>
        )}

        {/* FOOTER */}

        <footer className="mt-12 border-t border-stone-200 py-6">
          <p className="text-center text-xs text-stone-400">
            Savora · Made for food lovers
          </p>
        </footer>
      </main>
    </div>
  );
}
