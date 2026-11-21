import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Utensils, ImageOff, LoaderCircle, ArrowRight } from "lucide-react";

import UserNavBar from "../components/user/UserNavBar";

import { logout } from "../features/auth/authSlice";

import { fetchCategories } from "../features/categories/categoriesSlice";
import { fetchRecipes } from "../features/recipes/recipesSlice";

function CategoryCard({ category, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-xl border border-stone-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 overflow-hidden bg-stone-100 sm:h-48">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-400">
            <ImageOff size={30} />
            <span className="text-xs">Image unavailable</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-4">
        <h3 className="text-sm font-semibold text-stone-800 transition group-hover:text-orange-700 sm:text-base">
          {category.name}
        </h3>

        <ArrowRight
          size={16}
          className="text-stone-400 transition group-hover:translate-x-1 group-hover:text-orange-600"
        />
      </div>
    </button>
  );
}

function SectionHeading({ title, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
        {title}
      </h2>

      {children}
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

  // Fetch categories and recipes.
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

  // Navigate when a search result is selected.
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

  const isLoading = categoriesLoading || recipesLoading;

  const error = categoriesError || recipesError;

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
        {/* Page introduction */}
        <section className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
            Discover something delicious
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            Categories
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 sm:text-base">
            Explore our menu and find something delicious for your next meal.
          </p>
        </section>

        {/* Categories */}
        <section>
          <SectionHeading title="Categories">
            <button
              type="button"
              className="rounded-lg bg-[#4B5563] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#374151] sm:text-sm"
            >
              Order History
            </button>
          </SectionHeading>

          {/* Loading */}
          {isLoading && (
            <div className="flex min-h-48 items-center justify-center">
              <div className="flex items-center gap-3 text-stone-500">
                <LoaderCircle size={22} className="animate-spin" />

                <span className="text-sm">Loading menu...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Unable to load menu: {error}
            </div>
          )}

          {/* Category grid */}
          {!isLoading && !error && categories.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => navigate(`/categories/${category.id}/recipes`)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && categories.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <Utensils size={26} />
              </div>

              <h3 className="text-base font-semibold text-stone-800">
                No categories available yet
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                Our menu will be available here soon.
              </p>
            </div>
          )}
        </section>

        {/* Search results */}
        {searchQuery.trim() && (
          <section className="mt-10">
            <SectionHeading title="Search Results" />

            {searchResults.length === 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
                No matching categories or recipes found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => handleSearchResultClick(result)}
                    className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 text-left shadow-sm transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt={result.name}
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-400">
                        <ImageOff size={22} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-800">
                        {result.name}
                      </p>

                      <p className="text-xs capitalize text-stone-500">
                        {result.type}
                      </p>

                      {result.type === "recipe" && (
                        <p className="mt-1 text-sm font-semibold text-orange-700">
                          ₹{Number(result.price || 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
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
