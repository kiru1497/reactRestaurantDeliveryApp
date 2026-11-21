import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Utensils,
  ImageOff,
  LoaderCircle,
  ArrowRight,
  Clock3,
  ShoppingBag,
  Sparkles,
  Search,
} from "lucide-react";

import UserNavBar from "../components/user/UserNavBar";

import { logout } from "../features/auth/authSlice";

import { fetchCategories } from "../features/categories/categoriesSlice";
import { fetchRecipes } from "../features/recipes/recipesSlice";

function CategoryCard({ category, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl bg-white text-left
      shadow-sm ring-1 ring-black/5 transition-all duration-500
      hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-900/10"
    >
      {/* Category Image */}
      <div className="relative h-56 overflow-hidden sm:h-64">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover transition duration-700
            group-hover:scale-110"
          />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center
          gap-3 bg-gradient-to-br from-orange-50 to-stone-100 text-stone-400"
          >
            <ImageOff size={36} strokeWidth={1.5} />
            <span className="text-xs font-medium">Image unavailable</span>
          </div>
        )}

        {/* Image Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/75
        via-black/15 to-transparent opacity-80 transition duration-500
        group-hover:opacity-100"
        />

        {/* Category Label */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p
                className="mb-2 text-[10px] font-semibold uppercase
              tracking-[0.2em] text-orange-200"
              >
                Explore menu
              </p>

              <h3
                className="text-xl font-bold tracking-tight text-white
              sm:text-2xl"
              >
                {category.name}
              </h3>
            </div>

            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center
            rounded-full bg-white/20 text-white backdrop-blur-md
            transition-all duration-300 group-hover:bg-orange-500
            group-hover:translate-x-1"
            >
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function SectionHeading({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {subtitle && (
          <p
            className="mb-1 text-xs font-bold uppercase tracking-[0.18em]
          text-orange-700"
          >
            {subtitle}
          </p>
        )}

        <h2
          className="text-2xl font-bold tracking-tight text-[#292D22]
        sm:text-3xl"
        >
          {title}
        </h2>
      </div>

      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-3xl border border-dashed border-stone-300
    bg-white px-6 py-16 text-center shadow-sm"
    >
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center
      rounded-2xl bg-orange-50 text-orange-600"
      >
        <Utensils size={30} strokeWidth={1.6} />
      </div>

      <h3 className="text-lg font-bold text-stone-800">
        The menu is getting ready
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
        Our delicious categories will appear here soon. Check back in a little
        while!
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center
    rounded-3xl bg-white shadow-sm"
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center
      rounded-2xl bg-orange-50 text-orange-600"
      >
        <LoaderCircle size={28} className="animate-spin" />
      </div>

      <p className="text-sm font-semibold text-stone-700">
        Preparing something delicious...
      </p>

      <p className="mt-1 text-xs text-stone-400">
        Please wait while we load the menu
      </p>
    </div>
  );
}

export default function UserHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    status: categoriesStatus,
  } = useSelector((state) => state.categories);

  const {
    items: recipes,
    isLoading: recipesLoading,
    error: recipesError,
    status: recipesStatus,
  } = useSelector((state) => state.recipes);

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories and recipes
  useEffect(() => {
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }

    if (recipesStatus === "idle") {
      dispatch(fetchRecipes());
    }
  }, [dispatch, categoriesStatus, recipesStatus]);

  // Search categories and recipes
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

  // Navigate from search results
  const handleSearchResultClick = (result) => {
    if (result.type === "category") {
      navigate(`/categories/${result.id}/recipes`);
      return;
    }

    if (result.type === "recipe" && result.categoryId) {
      navigate(`/categories/${result.categoryId}/recipes`);
    }
  };

  // Order history
  const handleOrderHistory = () => {
    navigate("/order-history");
  };

  // Logout
  const handleLogout = () => {
    dispatch(logout());

    navigate("/login", {
      replace: true,
    });
  };

  const isLoading = categoriesLoading || recipesLoading;
  const error = categoriesError || recipesError;

  return (
    <div className="min-h-screen bg-[#F8F5EF]">
      <UserNavBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onResultClick={handleSearchResultClick}
        onLogout={handleLogout}
      />

      <main
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6
      sm:py-10 lg:px-8"
      >
        {/* Hero Section */}
        {!searchQuery.trim() && (
          <section
            className="relative mb-10 overflow-hidden rounded-[2rem]
          bg-[#303A2D] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14"
          >
            {/* Decorative background */}
            <div
              className="pointer-events-none absolute -right-20 -top-24
            h-72 w-72 rounded-full border border-white/10"
            />

            <div
              className="pointer-events-none absolute -right-10 top-10
            h-52 w-52 rounded-full border border-white/10"
            />

            <div
              className="pointer-events-none absolute bottom-0 right-10
            hidden text-white/[0.04] sm:block"
            >
              <Utensils size={240} strokeWidth={0.7} />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full
              border border-white/15 bg-white/10 px-3 py-1.5 text-xs
              font-medium text-orange-200 backdrop-blur-sm"
              >
                <Sparkles size={14} />
                Made for food lovers
              </div>

              <h1
                className="text-3xl font-extrabold leading-tight
              tracking-tight sm:text-5xl lg:text-6xl"
              >
                Good food.
                <br />
                <span className="text-[#E8B56A]">Good mood.</span>
              </h1>

              <p
                className="mt-5 max-w-lg text-sm leading-7 text-stone-300
              sm:text-base"
              >
                Discover your favourites, explore something new, and let
                delicious food make your day a little better.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <div
                  className="inline-flex items-center gap-2 text-sm
                text-stone-300"
                >
                  <Utensils size={16} className="text-orange-300" />
                  Explore our menu
                </div>

                <div className="h-1 w-1 rounded-full bg-orange-300" />

                <div
                  className="inline-flex items-center gap-2 text-sm
                text-stone-300"
                >
                  <Clock3 size={16} className="text-orange-300" />
                  Made fresh for you
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section>
          <SectionHeading
            title={
              searchQuery.trim() ? "Browse Categories" : "Explore our menu"
            }
            subtitle={
              searchQuery.trim()
                ? "Find your favourites"
                : "Something delicious awaits"
            }
          >
            <button
              type="button"
              onClick={handleOrderHistory}
              className="inline-flex items-center gap-2 rounded-xl
              bg-[#303A2D] px-4 py-3 text-sm font-semibold text-white
              shadow-md transition hover:bg-[#414C3C] hover:shadow-lg
              active:scale-[0.98]"
            >
              <ShoppingBag size={16} />
              <span>Order History</span>
            </button>
          </SectionHeading>

          {/* Loading */}
          {isLoading && <LoadingState />}

          {/* Error */}
          {!isLoading && error && (
            <div
              className="rounded-2xl border border-red-200
            bg-red-50 p-5 text-sm text-red-700"
            >
              Unable to load menu: {error}
            </div>
          )}

          {/* Category Grid */}
          {!isLoading && !error && categories.length > 0 && (
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2
            lg:grid-cols-3 xl:grid-cols-4"
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => navigate(`/categories/${category.id}/recipes`)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && categories.length === 0 && <EmptyState />}
        </section>

        {/* Search Results */}
        {searchQuery.trim() && (
          <section className="mt-12">
            <SectionHeading
              title="Search Results"
              subtitle={`Results for "${searchQuery}"`}
            />

            {searchResults.length === 0 ? (
              <div
                className="rounded-3xl border border-stone-200
              bg-white px-6 py-12 text-center shadow-sm"
              >
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center
                justify-center rounded-2xl bg-orange-50 text-orange-500"
                >
                  <Search size={24} />
                </div>

                <h3 className="font-semibold text-stone-800">
                  Nothing delicious found
                </h3>

                <p className="mt-2 text-sm text-stone-500">
                  Try another category, dish, or ingredient.
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2
              lg:grid-cols-3"
              >
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => handleSearchResultClick(result)}
                    className="group flex items-center gap-4 rounded-2xl
                    border border-stone-200/80 bg-white p-3 text-left
                    shadow-sm transition-all duration-300 hover:-translate-y-1
                    hover:border-orange-200 hover:shadow-lg"
                  >
                    {/* Image */}
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt={result.name}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover
                        transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="flex h-20 w-20 shrink-0
                      items-center justify-center rounded-xl bg-orange-50
                      text-orange-400"
                      >
                        <ImageOff size={24} />
                      </div>
                    )}

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-bold text-stone-800
                      transition group-hover:text-orange-700"
                      >
                        {result.name}
                      </p>

                      <span
                        className="mt-1 inline-flex rounded-full
                      bg-stone-100 px-2.5 py-1 text-[10px] font-semibold
                      uppercase tracking-wider text-stone-500"
                      >
                        {result.type}
                      </span>

                      {result.type === "recipe" && (
                        <p className="mt-2 text-sm font-bold text-orange-700">
                          ₹{Number(result.price || 0).toFixed(2)}
                        </p>
                      )}
                    </div>

                    <ArrowRight
                      size={18}
                      className="mr-1 shrink-0 text-stone-400
                      transition group-hover:translate-x-1
                      group-hover:text-orange-600"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-stone-200/80 py-8">
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center
            rounded-xl bg-[#303A2D] text-orange-200"
            >
              <Utensils size={18} />
            </div>

            <p className="text-sm font-semibold tracking-wide text-stone-600">
              Savora
            </p>

            <p className="text-xs text-stone-400">
              Made with love for food lovers
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
