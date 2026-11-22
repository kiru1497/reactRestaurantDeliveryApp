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

/* --------------------------------------------------
   Category Card
-------------------------------------------------- */

function CategoryCard({ category, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[22px]
      border border-[#6A2A17]/20 bg-[#F8EBDD]
      text-left shadow-[0_5px_15px_rgba(66,27,13,0.08)]
      transition-all duration-500
      hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(66,27,13,0.16)]"
    >
      {/* Category Image */}
      <div className="relative h-48 overflow-hidden sm:h-52">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name || "Food category"}
            className="h-full w-full object-cover transition-transform
            duration-700 group-hover:scale-110"
          />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center
            gap-3 bg-gradient-to-br from-[#F5E6D1] to-[#E8D4BC]
            text-[#8A6A54]"
          >
            <ImageOff size={34} strokeWidth={1.4} />
            <span className="text-xs font-medium">Image unavailable</span>
          </div>
        )}

        {/* Image Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t
          from-[#250D06]/90 via-[#250D06]/25 to-transparent"
        />

        {/* Category Details */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p
                className="mb-2 text-[10px] font-bold uppercase
                tracking-[0.2em] text-[#F3B94E]"
              >
                Explore menu
              </p>

              <h3
                className="font-serif text-2xl font-bold tracking-wide
                text-[#FFF7ED] sm:text-3xl"
              >
                {category.name}
              </h3>
            </div>

            <div
              className="flex h-11 w-11 shrink-0 items-center
              justify-center rounded-full bg-[#FFF2E5]
              text-[#5D1D0D] shadow-md transition-all duration-300
              group-hover:translate-x-1 group-hover:bg-[#E96A24]
              group-hover:text-white"
            >
              <ArrowRight size={19} strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

/* --------------------------------------------------
   Section Heading
-------------------------------------------------- */

function SectionHeading({ title, subtitle, children }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
      <div>
        {subtitle && (
          <p
            className="mb-2 text-[11px] font-bold uppercase
            tracking-[0.18em] text-[#C84A15]"
          >
            {subtitle}
          </p>
        )}

        <h2
          className="font-serif text-3xl font-bold tracking-tight
          text-[#4A1C0D] sm:text-4xl"
        >
          {title}
        </h2>

        <div className="mt-4 h-[3px] w-20 bg-[#E85D1D]" />
      </div>

      {children}
    </div>
  );
}

/* --------------------------------------------------
   Empty State
-------------------------------------------------- */

function EmptyState() {
  return (
    <div
      className="rounded-[28px] border border-[#E7D7C6]
      bg-[#FFF9F1] px-6 py-16 text-center
      shadow-[0_5px_20px_rgba(75,32,14,0.04)]"
    >
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center
        justify-center rounded-2xl bg-[#F8E7D5] text-[#C84A15]"
      >
        <Utensils size={30} strokeWidth={1.5} />
      </div>

      <h3 className="font-serif text-xl font-bold text-[#4A1C0D]">
        The menu is getting ready
      </h3>

      <p
        className="mx-auto mt-3 max-w-sm text-sm leading-7
        text-[#886F5E]"
      >
        Our delicious categories will appear here soon. Check back in a little
        while!
      </p>
    </div>
  );
}

/* --------------------------------------------------
   Loading State
-------------------------------------------------- */

function LoadingState() {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center
      rounded-[28px] border border-[#E8D8C8] bg-[#FFF9F1]
      shadow-sm"
    >
      <div
        className="mb-4 flex h-14 w-14 items-center
        justify-center rounded-2xl bg-[#F8E7D5] text-[#C84A15]"
      >
        <LoaderCircle size={27} className="animate-spin" />
      </div>

      <p className="font-serif text-lg font-bold text-[#4A1C0D]">
        Preparing something delicious...
      </p>

      <p className="mt-2 text-xs text-[#9B8170]">
        Please wait while we load the menu
      </p>
    </div>
  );
}

/* --------------------------------------------------
   Main User Home
-------------------------------------------------- */

export default function UserHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    status: categoriesStatus,
  } = useSelector((state) => state.categories);

  const {
    items: recipes = [],
    isLoading: recipesLoading,
    error: recipesError,
    status: recipesStatus,
  } = useSelector((state) => state.recipes);

  const [searchQuery, setSearchQuery] = useState("");

  /* Fetch categories and recipes */
  useEffect(() => {
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }

    if (recipesStatus === "idle") {
      dispatch(fetchRecipes());
    }
  }, [dispatch, categoriesStatus, recipesStatus]);

  /* Search Categories and Recipes */
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

        const matchesIngredients = Array.isArray(recipe.ingredients)
          ? recipe.ingredients.some((ingredient) =>
              String(ingredient).toLowerCase().includes(query),
            )
          : false;

        return matchesName || matchesCategory || matchesIngredients;
      })
      .map((recipe) => ({
        ...recipe,
        type: "recipe",
      }));

    return [...matchingCategories, ...matchingRecipes];
  }, [searchQuery, categories, recipes]);

  /* Search Result Navigation */
  const handleSearchResultClick = (result) => {
    if (result.type === "category") {
      navigate(`/categories/${result.id}/recipes`);
      return;
    }

    if (result.type === "recipe" && result.categoryId) {
      navigate(`/categories/${result.categoryId}/recipes`);
    }
  };

  /* Order History */
  const handleOrderHistory = () => {
    navigate("/order-history");
  };

  /* Logout */
  const handleLogout = () => {
    dispatch(logout());

    navigate("/login", {
      replace: true,
    });
  };

  const isLoading = categoriesLoading || recipesLoading;
  const error = categoriesError || recipesError;

  return (
    <div className="min-h-screen overflow-hidden bg-[#FFF4E8] text-[#4A1C0D]">
      {/* Navbar */}
      <UserNavBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onResultClick={handleSearchResultClick}
        onLogout={handleLogout}
      />

      <main className="relative mx-auto max-w-[1600px] px-4 pb-0 sm:px-6 lg:px-10">
        {/* Decorative Background */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[350px]
          -z-10 h-[500px] opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, #F3DDC5 0%, transparent 60%)",
          }}
        />

        {/* --------------------------------------------------
            HERO SECTION
        -------------------------------------------------- */}

        {!searchQuery.trim() && (
          <section
            className="relative mb-8 mt-1 overflow-hidden
            rounded-[28px] border border-[#5A2615]/15
            bg-[#310E06] shadow-[0_15px_40px_rgba(60,20,8,0.12)]"
          >
            {/* Hero Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=2000&q=90')",
              }}
            />

            {/* Dark Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-r
              from-[#280A04] via-[#3A1007]/95 to-[#3A1007]/10"
            />

            {/* Additional Image Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t
              from-[#2B0B04]/40 to-transparent"
            />

            {/* Hero Content */}
            <div
              className="relative z-10 flex min-h-[340px] items-center
              px-6 py-10 sm:min-h-[390px] sm:px-10 sm:py-12
              lg:min-h-[420px] lg:px-16"
            >
              <div className="max-w-[570px]">
                {/* Badge */}
                <div
                  className="mb-5 inline-flex items-center gap-2
                  rounded-full border border-[#F5B94C]/20
                  bg-[#6E240E]/60 px-4 py-2
                  text-xs font-medium text-[#FFE5B0]
                  backdrop-blur-sm"
                >
                  <Sparkles size={14} className="text-[#F7BD53" />
                  Made for food lovers
                </div>

                {/* Heading */}
                <h1
                  className="font-serif text-[42px] font-bold
                  leading-[1.08] tracking-tight text-[#FFF7EC]
                  sm:text-6xl lg:text-[68px]"
                >
                  Good food.
                  <br />
                  <span className="text-[#F1B34D]">Good mood.</span>
                </h1>

                {/* Description */}
                <p
                  className="mt-5 max-w-[500px] text-sm leading-7
                  text-[#F1DDD0] sm:text-base sm:leading-8"
                >
                  Discover your favourites, explore something new, and let
                  delicious food make your day a little better.
                </p>

                {/* Hero Information */}
                <div className="mt-7 flex flex-wrap items-center gap-4 sm:gap-5">
                  <div
                    className="inline-flex items-center gap-2
                    text-sm text-[#F8E7D6]"
                  >
                    <Utensils size={17} className="text-[#F3B548]" />
                    Explore our menu
                  </div>

                  <span className="h-1 w-1 rounded-full bg-[#F3B548]" />

                  <div
                    className="inline-flex items-center gap-2
                    text-sm text-[#F8E7D6]"
                  >
                    <Clock3 size={17} className="text-[#F3B548]" />
                    Made fresh for you
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --------------------------------------------------
            CATEGORIES SECTION
        -------------------------------------------------- */}

        <section className="relative z-10 pb-12 pt-1 sm:pb-16">
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
            {/* Order History Button */}
            <button
              type="button"
              onClick={handleOrderHistory}
              className="inline-flex items-center gap-2.5
              rounded-2xl border border-[#6C2614]/10
              bg-[#651F0D] px-5 py-3
              text-sm font-semibold text-[#FFF7EC]
              shadow-[0_5px_15px_rgba(80,25,8,0.15)]
              transition-all duration-300
              hover:-translate-y-0.5 hover:bg-[#7B2C14]
              hover:shadow-[0_8px_20px_rgba(80,25,8,0.2)]
              active:scale-[0.98]"
            >
              <ShoppingBag size={17} strokeWidth={1.8} />
              Order History
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
              className="grid grid-cols-1 gap-5
              sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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

        {/* --------------------------------------------------
            SEARCH RESULTS
        -------------------------------------------------- */}

        {searchQuery.trim() && (
          <section className="mb-12">
            <SectionHeading
              title="Search Results"
              subtitle={`Results for "${searchQuery}"`}
            />

            {/* No Results */}
            {searchResults.length === 0 ? (
              <div
                className="rounded-[28px] border border-[#E7D7C6]
                bg-[#FFF9F1] px-6 py-12 text-center
                shadow-sm"
              >
                <div
                  className="mx-auto mb-4 flex h-14 w-14
                  items-center justify-center rounded-2xl
                  bg-[#F8E7D5] text-[#C84A15]"
                >
                  <Search size={24} />
                </div>

                <h3 className="font-serif text-lg font-bold text-[#4A1C0D]">
                  Nothing delicious found
                </h3>

                <p className="mt-2 text-sm text-[#886F5E]">
                  Try another category, dish, or ingredient.
                </p>
              </div>
            ) : (
              /* Search Results */
              <div
                className="grid grid-cols-1 gap-4
                sm:grid-cols-2 lg:grid-cols-3"
              >
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => handleSearchResultClick(result)}
                    className="group flex items-center gap-4
                    rounded-2xl border border-[#E7D7C6]
                    bg-[#FFF9F1] p-3 text-left
                    shadow-[0_4px_12px_rgba(75,32,14,0.04)]
                    transition-all duration-300
                    hover:-translate-y-1 hover:border-[#E8A276]
                    hover:shadow-[0_10px_25px_rgba(75,32,14,0.1)]"
                  >
                    {/* Image */}
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt={result.name || "Menu item"}
                        className="h-20 w-20 shrink-0 rounded-xl
                        object-cover transition duration-300
                        group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="flex h-20 w-20 shrink-0
                        items-center justify-center rounded-xl
                        bg-[#F8E7D5] text-[#B97848]"
                      >
                        <ImageOff size={24} />
                      </div>
                    )}

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-semibold text-[#4A1C0D]
                        transition group-hover:text-[#C84A15]"
                      >
                        {result.name}
                      </p>

                      <span
                        className="mt-2 inline-flex rounded-full
                        bg-[#F1E5D7] px-2.5 py-1
                        text-[10px] font-semibold uppercase
                        tracking-wider text-[#886F5E]"
                      >
                        {result.type}
                      </span>

                      {result.type === "recipe" && (
                        <p className="mt-2 font-semibold text-[#C84A15]">
                          ₹{Number(result.price || 0).toFixed(2)}
                        </p>
                      )}
                    </div>

                    <ArrowRight
                      size={18}
                      className="mr-1 shrink-0 text-[#B78C70]
                      transition group-hover:translate-x-1
                      group-hover:text-[#C84A15]"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* --------------------------------------------------
          FOOTER
      -------------------------------------------------- */}

      <footer className="relative mt-0 overflow-hidden bg-[#303A22] text-[#F8F0E5]">
        {/* Decorative Wave */}
        <div className="absolute -top-[1px] left-0 w-full">
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            className="block h-[65px] w-full"
            fill="#FFF4E8"
          >
            <path
              d="M0,0 H1440 V5
              C1260,10 1190,45 1030,35
              C900,25 790,65 650,50
              C510,35 430,75 300,70
              C170,65 100,35 0,45 Z"
            />
          </svg>
        </div>

        {/* Decorative Leaf Details */}
        <div
          className="pointer-events-none absolute bottom-4 left-0
          hidden opacity-30 sm:block"
        >
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            fill="none"
            stroke="#D6B36B"
            strokeWidth="1"
          >
            <path d="M10 175 Q70 105 150 20" />
            <path d="M35 145 Q5 110 15 85 Q50 105 35 145Z" />
            <path d="M60 115 Q35 75 50 55 Q85 80 60 115Z" />
            <path d="M85 90 Q65 45 80 25 Q110 55 85 90Z" />
            <path d="M50 135 Q90 130 105 110 Q80 100 50 135Z" />
            <path d="M75 110 Q115 100 125 80 Q95 75 75 110Z" />
            <path d="M100 75 Q135 70 150 45 Q120 40 100 75Z" />
          </svg>
        </div>

        <div
          className="pointer-events-none absolute bottom-4 right-0
          hidden rotate-180 opacity-30 sm:block"
        >
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            fill="none"
            stroke="#D6B36B"
            strokeWidth="1"
          >
            <path d="M10 175 Q70 105 150 20" />
            <path d="M35 145 Q5 110 15 85 Q50 105 35 145Z" />
            <path d="M60 115 Q35 75 50 55 Q85 80 60 115Z" />
            <path d="M85 90 Q65 45 80 25 Q110 55 85 90Z" />
            <path d="M50 135 Q90 130 105 110 Q80 100 50 135Z" />
            <path d="M75 110 Q115 100 125 80 Q95 75 75 110Z" />
            <path d="M100 75 Q135 70 150 45 Q120 40 100 75Z" />
          </svg>
        </div>

        {/* Footer Content */}
        <div
          className="relative z-10 mx-auto flex max-w-7xl
          flex-col items-center px-4 pb-8 pt-20 sm:pt-24"
        >
          {/* Logo Icon */}
          <div
            className="flex h-12 w-12 items-center
            justify-center rounded-2xl bg-[#F7EBDD]
            text-[#5B210F] shadow-sm"
          >
            <Utensils size={23} strokeWidth={1.8} />
          </div>

          {/* Decorative Divider */}
          <div className="mt-4 flex items-center gap-5">
            <div className="h-px w-20 bg-[#A59A65]/70" />

            <p className="font-serif text-2xl font-bold text-[#F7EBDD]">
              Savora
            </p>

            <div className="h-px w-20 bg-[#A59A65]/70" />
          </div>

          {/* Footer Text */}
          <p className="mt-3 text-sm text-[#E7DFC9]">
            Made with love for food lovers
          </p>
        </div>
      </footer>
    </div>
  );
}
