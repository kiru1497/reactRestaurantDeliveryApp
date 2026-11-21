import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ImageOff,
  LoaderCircle,
  ShoppingBag,
} from "lucide-react";

import UserNavBar from "../../components/user/UserNavBar";

import { logout } from "../../features/auth/authSlice";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../../features/cart/cartSlice";

import { fetchCategories } from "../../features/categories/categoriesSlice";
import { fetchRecipes } from "../../features/recipes/recipesSlice";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price || 0));

function CartItem({ item, imageUrl, dispatch }) {
  const itemTotal = Number(item.price) * item.quantity;

  return (
    <article className="flex flex-col gap-4 border-b border-stone-100 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      {/* Image */}
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-20 sm:w-20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <ImageOff size={24} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-stone-900 sm:text-base">
          {item.name}
        </h3>

        {item.categoryName && (
          <p className="mt-1 text-xs text-stone-500">{item.categoryName}</p>
        )}

        <p className="mt-1 text-sm text-stone-500">
          {formatPrice(item.price)} per item
        </p>

        <p className="mt-2 text-sm font-bold text-orange-700">
          {formatPrice(itemTotal)}
        </p>
      </div>

      {/* Quantity and remove */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        {/* Quantity controls */}
        <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50">
          <button
            type="button"
            aria-label={`Decrease quantity of ${item.name}`}
            onClick={() => dispatch(decreaseQuantity(item.id))}
            className="flex h-9 w-9 items-center justify-center rounded-l-lg text-stone-600 transition hover:bg-orange-50 hover:text-orange-700"
          >
            <Minus size={15} />
          </button>

          <span className="flex min-w-9 items-center justify-center text-sm font-semibold text-stone-800">
            {item.quantity}
          </span>

          <button
            type="button"
            aria-label={`Increase quantity of ${item.name}`}
            onClick={() => dispatch(increaseQuantity(item.id))}
            className="flex h-9 w-9 items-center justify-center rounded-r-lg text-stone-600 transition hover:bg-orange-50 hover:text-orange-700"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={() => dispatch(removeFromCart(item.id))}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={15} />
          Remove
        </button>
      </div>
    </article>
  );
}

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.items);

  const { items: categories, status: categoriesStatus } = useSelector(
    (state) => state.categories,
  );

  const {
    items: recipes,
    status: recipesStatus,
    isLoading: recipesLoading,
  } = useSelector((state) => state.recipes);

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data when needed for navbar search and recipe images.
  useEffect(() => {
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }

    if (recipesStatus === "idle") {
      dispatch(fetchRecipes());
    }
  }, [dispatch, categoriesStatus, recipesStatus]);

  // Search categories and recipes.
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    const matchingCategories = categories
      .filter((category) => category.name?.toLowerCase().includes(query))
      .map((category) => ({
        ...category,
        type: "category",
      }));

    const matchingRecipes = recipes
      .filter((recipe) => {
        const matchesName = recipe.name?.toLowerCase().includes(query);

        const matchesCategory = recipe.categoryName
          ?.toLowerCase()
          .includes(query);

        const matchesIngredients = recipe.ingredients?.some((ingredient) =>
          ingredient.toLowerCase().includes(query),
        );

        return matchesName || matchesCategory || matchesIngredients;
      })
      .map((recipe) => ({
        ...recipe,
        type: "recipe",
      }));

    return [...matchingCategories, ...matchingRecipes];
  }, [searchQuery, categories, recipes]);

  // Navigate from navbar search.
  const handleSearchResultClick = (result) => {
    if (result.type === "category") {
      navigate(`/categories/${result.id}/recipes`);
      return;
    }

    if (result.type === "recipe" && result.categoryId) {
      navigate(`/categories/${result.categoryId}/recipes`);
    }
  };

  // Logout.
  const handleLogout = () => {
    dispatch(logout());

    navigate("/login", {
      replace: true,
    });
  };

  // Get image URLs from the recipe data already loaded through IndexedDB.
  const recipeImageMap = useMemo(() => {
    return Object.fromEntries(
      recipes.map((recipe) => [recipe.id, recipe.imageUrl]),
    );
  }, [recipes]);

  // Calculate cart total.
  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Shared Navbar */}
      <UserNavBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onResultClick={handleSearchResultClick}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </button>

        {/* Heading */}
        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <ShoppingCart size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
                Your Cart
              </h1>

              <p className="mt-1 text-sm text-stone-500">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {recipesLoading && (
          <div className="mb-4 flex items-center gap-2 text-sm text-stone-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading recipe images...
          </div>
        )}

        {/* Empty cart */}
        {cartItems.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <ShoppingBag size={30} />
            </div>

            <h2 className="text-lg font-bold text-stone-800">
              Your cart is empty
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-stone-500">
              Looks like you haven't added anything delicious to your cart yet.
            </p>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
            >
              Explore Categories
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            {/* Cart items */}
            <div>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  imageUrl={recipeImageMap[item.id]}
                  dispatch={dispatch}
                />
              ))}
            </div>

            {/* Cart summary */}
            <div className="border-t border-stone-200 bg-stone-50/80 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Total */}
                <div>
                  <p className="text-xs font-medium text-stone-500">
                    Cart Total
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-stone-900 sm:text-2xl">
                    {formatPrice(cartTotal)}
                  </p>
                </div>

                {/* Checkout */}
                <button
                  type="button"
                  onClick={() => {}}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-stone-200 py-6">
          <p className="text-center text-xs text-stone-400">
            Savora · Made for food lovers
          </p>
        </footer>
      </main>
    </div>
  );
}
