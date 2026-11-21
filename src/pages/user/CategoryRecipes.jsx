import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ImageOff,
  LoaderCircle,
  Utensils,
} from "lucide-react";

import UserNavBar from "../../components/user/UserNavBar";

import { logout } from "../../features/auth/authSlice";
import { addToCart } from "../../features/cart/cartSlice";

import { fetchCategories } from "../../features/categories/categoriesSlice";
import { fetchRecipes } from "../../features/recipes/recipesSlice";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price || 0));
}

function RecipeCard({ recipe, onAddToCart }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Recipe image */}
      <div className="relative h-48 overflow-hidden bg-stone-100 sm:h-52">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-400">
            <ImageOff size={34} />
            <span className="text-xs">Image unavailable</span>
          </div>
        )}
      </div>

      {/* Recipe details */}
      <div className="flex flex-1 flex-col p-4">
        <div>
          <h3 className="text-base font-bold text-stone-900">{recipe.name}</h3>

          {/* Ingredients */}
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-semibold text-stone-700">
              Ingredients
            </p>

            {recipe.ingredients?.length > 0 ? (
              <ul className="space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={`${recipe.id}-ingredient-${index}`}
                    className="flex items-start gap-2 text-xs text-stone-500"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-orange-500" />

                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400">No ingredients listed.</p>
            )}
          </div>
        </div>

        {/* Price and Add to Cart */}
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
            <div>
              <p className="text-xs text-stone-400">Price</p>

              <p className="mt-1 text-base font-bold text-orange-700">
                {formatPrice(recipe.price)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddToCart(recipe)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 sm:px-4"
            >
              <Utensils size={15} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CategoryRecipes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categoryId } = useParams();

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

  // Fetch categories and recipes when necessary.
  useEffect(() => {
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }

    if (recipesStatus === "idle") {
      dispatch(fetchRecipes());
    }
  }, [dispatch, categoriesStatus, recipesStatus]);

  // Find selected category.
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  // Filter recipes belonging to this category.
  const categoryRecipes = useMemo(() => {
    if (!categoryId) return [];

    return recipes.filter((recipe) => {
      if (recipe.categoryId) {
        return recipe.categoryId === categoryId;
      }

      // Fallback for older records.
      return (
        recipe.categoryName?.toLowerCase() ===
        selectedCategory?.name?.toLowerCase()
      );
    });
  }, [recipes, categoryId, selectedCategory]);

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

  // Navigate from search results.
  const handleSearchResultClick = (result) => {
    if (result.type === "category") {
      navigate(`/categories/${result.id}/recipes`);
      return;
    }

    if (result.type === "recipe" && result.categoryId) {
      navigate(`/categories/${result.categoryId}/recipes`);
    }
  };

  // Add recipe to cart.
  const handleAddToCart = (recipe) => {
    dispatch(addToCart(recipe));
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
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50 hover:text-orange-800"
        >
          <ArrowLeft size={16} />
          Back to Categories
        </button>

        {/* Category heading */}
        {!isLoading && selectedCategory && (
          <section className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Category image */}
              {selectedCategory.imageUrl && (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                  <img
                    src={selectedCategory.imageUrl}
                    alt={selectedCategory.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Heading */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
                  Explore our menu
                </p>

                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
                  {selectedCategory.name}
                </h1>

                <p className="mt-2 text-sm text-stone-500">
                  Discover delicious dishes from this category.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-stone-500">
              <LoaderCircle size={22} className="animate-spin" />
              <span className="text-sm">Loading recipes...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load recipes: {error}
          </div>
        )}

        {/* Category not found */}
        {!isLoading && !error && !selectedCategory && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <ImageOff size={32} className="mx-auto mb-4 text-stone-400" />

            <h2 className="text-lg font-semibold text-stone-800">
              Category not found
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              This category may have been removed.
            </p>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Back to Categories
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Recipes */}
        {!isLoading && !error && selectedCategory && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                Available Recipes
              </h2>

              <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
                {categoryRecipes.length}{" "}
                {categoryRecipes.length === 1 ? "Recipe" : "Recipes"}
              </span>
            </div>

            {/* Recipe cards */}
            {categoryRecipes.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <Utensils size={26} />
                </div>

                <h3 className="text-base font-semibold text-stone-800">
                  No recipes in this category yet
                </h3>

                <p className="mt-2 max-w-sm text-sm text-stone-500">
                  Our chefs are working on adding delicious recipes to this
                  category.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Search results */}
        {searchQuery.trim() && (
          <section className="mt-10 border-t border-stone-200 pt-8">
            <h2 className="mb-5 text-xl font-bold text-stone-900">
              Search Results
            </h2>

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
                          {formatPrice(result.price)}
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
