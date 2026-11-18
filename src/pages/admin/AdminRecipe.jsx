import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Upload,
  Plus,
  Minus,
  Pencil,
  Trash2,
  Save,
  X,
  LoaderCircle,
  ImagePlus,
  ChefHat,
} from "lucide-react";

import {
  fetchRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  clearRecipeError,
} from "../../features/recipes/recipesSlice";

import { fetchCategories } from "../../features/categories/categoriesSlice";

const emptyIngredients = [""];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price || 0));

function RecipeImage({ src, alt }) {
  return (
    <div className="flex h-48 w-full items-center justify-center overflow-hidden bg-slate-100">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <ImagePlus size={34} />
          <span className="text-xs">Image unavailable</span>
        </div>
      )}
    </div>
  );
}

export default function AdminRecipe() {
  const dispatch = useDispatch();

  const {
    items: recipes,
    isLoading,
    isSubmitting,
    error,
    status,
  } = useSelector((state) => state.recipes);

  const { items: categories, status: categoryStatus } = useSelector(
    (state) => state.categories,
  );

  // Add recipe form.
  const [recipeName, setRecipeName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [price, setPrice] = useState("");
  const [recipeImage, setRecipeImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Edit form.
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editIngredients, setEditIngredients] = useState([""]);
  const [editPrice, setEditPrice] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");

  const addImageInputRef = useRef(null);
  const editImageInputRef = useRef(null);

  // Load categories and recipes.
  useEffect(() => {
    if (categoryStatus === "idle") {
      dispatch(fetchCategories());
    }

    if (status === "idle") {
      dispatch(fetchRecipes());
    }
  }, [dispatch, categoryStatus, status]);

  // Validate image.
  const validateImage = (file) => {
    if (!file) return false;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      return false;
    }

    return true;
  };

  // Add form image.
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file || !validateImage(file)) return;

    setRecipeImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Edit form image.
  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file || !validateImage(file)) return;

    setEditImage(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  // Ingredient input management.
  const handleIngredientChange = (index, value) => {
    setIngredients((previous) =>
      previous.map((ingredient, i) => (i === index ? value : ingredient)),
    );
  };

  const addIngredientField = () => {
    setIngredients((previous) => [...previous, ""]);
  };

  const removeIngredientField = (index) => {
    setIngredients((previous) =>
      previous.length === 1 ? [""] : previous.filter((_, i) => i !== index),
    );
  };

  // Editing ingredient input management.
  const handleEditIngredientChange = (index, value) => {
    setEditIngredients((previous) =>
      previous.map((ingredient, i) => (i === index ? value : ingredient)),
    );
  };

  const addEditIngredientField = () => {
    setEditIngredients((previous) => [...previous, ""]);
  };

  const removeEditIngredientField = (index) => {
    setEditIngredients((previous) =>
      previous.length === 1 ? [""] : previous.filter((_, i) => i !== index),
    );
  };

  // Validate recipe.
  const validateRecipe = ({
    name,
    category,
    ingredients,
    price,
    image,
    requireImage = true,
  }) => {
    if (!name.trim()) {
      alert("Please enter the recipe name.");
      return false;
    }

    if (!category) {
      alert("Please select a category.");
      return false;
    }

    const validIngredients = ingredients.filter((item) => item.trim());

    if (validIngredients.length === 0) {
      alert("Please enter at least one ingredient.");
      return false;
    }

    if (ingredients.some((item) => !item.trim())) {
      alert("Please complete or remove empty ingredient fields.");
      return false;
    }

    if (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0) {
      alert("Please enter a valid non-negative price.");
      return false;
    }

    if (requireImage && !image) {
      alert("Please select a recipe image.");
      return false;
    }

    return true;
  };

  // Add recipe.
  const handleAddRecipe = async (e) => {
    e.preventDefault();

    if (
      !validateRecipe({
        name: recipeName,
        category: categoryId,
        ingredients,
        price,
        image: recipeImage,
      })
    ) {
      return;
    }

    try {
      await dispatch(
        addRecipe({
          name: recipeName,
          categoryId,
          ingredients,
          price,
          imageFile: recipeImage,
        }),
      ).unwrap();

      setRecipeName("");
      setCategoryId("");
      setIngredients(emptyIngredients);
      setPrice("");
      setRecipeImage(null);
      setImagePreview("");

      if (addImageInputRef.current) {
        addImageInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Unable to add recipe:", error);
    }
  };

  // Start editing.
  const startEditing = (recipe) => {
    setEditingId(recipe.id);
    setEditName(recipe.name);
    setEditCategoryId(recipe.categoryId);
    setEditIngredients(recipe.ingredients?.length ? recipe.ingredients : [""]);
    setEditPrice(String(recipe.price));
    setEditImage(null);
    setEditImagePreview("");

    dispatch(clearRecipeError());
  };

  // Cancel editing.
  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditCategoryId("");
    setEditIngredients([""]);
    setEditPrice("");
    setEditImage(null);
    setEditImagePreview("");

    if (editImageInputRef.current) {
      editImageInputRef.current.value = "";
    }
  };

  // Save edits.
  const handleUpdateRecipe = async (id) => {
    if (
      !validateRecipe({
        name: editName,
        category: editCategoryId,
        ingredients: editIngredients,
        price: editPrice,
        image: editImage,
        requireImage: false,
      })
    ) {
      return;
    }

    try {
      await dispatch(
        updateRecipe({
          id,
          name: editName,
          categoryId: editCategoryId,
          ingredients: editIngredients,
          price: editPrice,
          imageFile: editImage,
        }),
      ).unwrap();

      cancelEditing();
    } catch (error) {
      console.error("Unable to update recipe:", error);
    }
  };

  // Delete recipe.
  const handleDeleteRecipe = async (recipe) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${recipe.name}"?`,
    );

    if (!confirmed) return;

    try {
      await dispatch(deleteRecipe(recipe.id)).unwrap();
    } catch (error) {
      console.error("Unable to delete recipe:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Page heading */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Recipes
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create and manage your restaurant's recipes.
        </p>
      </div>

      {/* Add recipe card */}
      <section className="mb-7 rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-5 text-base font-semibold text-slate-900">
          Add New Recipe
        </h3>

        <form onSubmit={handleAddRecipe} className="space-y-4">
          {/* Recipe name */}
          <div>
            <label
              htmlFor="recipeName"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Recipe Name:
            </label>

            <input
              id="recipeName"
              type="text"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="Enter recipe name"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="recipeCategory"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Category:
            </label>

            <select
              id="recipeCategory"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {categoryStatus === "failed" && (
              <p className="mt-1 text-xs text-red-600">
                Unable to load categories. Please revisit the Categories page.
              </p>
            )}

            {categories.length === 0 && categoryStatus === "succeeded" && (
              <p className="mt-1 text-xs text-amber-600">
                Please create a category before adding recipes.
              </p>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Ingredients:
            </label>

            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) =>
                      handleIngredientChange(index, e.target.value)
                    }
                    placeholder={`Ingredient ${index + 1}`}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />

                  <button
                    type="button"
                    onClick={() => removeIngredientField(index)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    title="Remove ingredient"
                  >
                    <Minus size={15} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredientField}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              <Plus size={15} />
              Add Ingredient
            </button>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="recipePrice"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Price:
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                ₹
              </span>

              <input
                id="recipePrice"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => {
                  if (e.target.value === "" || Number(e.target.value) >= 0) {
                    setPrice(e.target.value);
                  }
                }}
                placeholder="0.00"
                required
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Recipe image */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Recipe Image:
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="recipeImage"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Upload size={15} />
                Choose File
              </label>

              <input
                ref={addImageInputRef}
                id="recipeImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />

              <span className="max-w-full truncate text-xs text-slate-500">
                {recipeImage ? recipeImage.name : "No file chosen"}
              </span>
            </div>

            {imagePreview && (
              <div className="mt-4 h-28 w-40 overflow-hidden rounded-lg border border-slate-200">
                <img
                  src={imagePreview}
                  alt="Recipe preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <p className="mt-2 text-xs text-slate-400">
              Select an image up to 5 MB. Images are stored in this browser.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || categories.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Adding Recipe...
              </>
            ) : (
              "Add Recipe"
            )}
          </button>
        </form>
      </section>

      {/* Recipes listing */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Existing Recipes
          </h3>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {recipes.length} Recipes
          </span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
            <LoaderCircle size={19} className="animate-spin" />
            Loading recipes...
          </div>
        )}

        {/* Failed loading */}
        {!isLoading && status === "failed" && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            <p>{error || "Unable to load recipes."}</p>

            <button
              type="button"
              onClick={() => dispatch(fetchRecipes())}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && status === "succeeded" && recipes.length === 0 && (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-4 text-center">
            <ChefHat size={32} className="mb-3 text-slate-300" />

            <p className="text-sm font-semibold text-slate-700">
              No recipes added yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Add your first recipe using the form above.
            </p>
          </div>
        )}

        {/* Recipe cards */}
        {!isLoading && recipes.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recipes.map((recipe) => (
              <article
                key={recipe.id}
                className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <RecipeImage
                  src={
                    editingId === recipe.id && editImagePreview
                      ? editImagePreview
                      : recipe.imageUrl
                  }
                  alt={recipe.name}
                />

                <div className="p-4">
                  {editingId === recipe.id ? (
                    <div className="space-y-3">
                      {/* Edit name */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Recipe Name
                        </label>

                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      {/* Edit category */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Category
                        </label>

                        <select
                          value={editCategoryId}
                          onChange={(e) => setEditCategoryId(e.target.value)}
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">Select category</option>

                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Edit ingredients */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Ingredients
                        </label>

                        <div className="space-y-2">
                          {editIngredients.map((ingredient, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <input
                                value={ingredient}
                                onChange={(e) =>
                                  handleEditIngredientChange(
                                    index,
                                    e.target.value,
                                  )
                                }
                                placeholder={`Ingredient ${index + 1}`}
                                className="min-w-0 flex-1 rounded-md border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                              />

                              <button
                                type="button"
                                onClick={() => removeEditIngredientField(index)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Minus size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={addEditIngredientField}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <Plus size={14} />
                          Add Ingredient
                        </button>
                      </div>

                      {/* Edit price */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Price
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => {
                            if (
                              e.target.value === "" ||
                              Number(e.target.value) >= 0
                            ) {
                              setEditPrice(e.target.value);
                            }
                          }}
                          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      {/* Edit image */}
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                        <Upload size={14} />
                        Change Image
                        <input
                          ref={editImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="sr-only"
                        />
                      </label>

                      {editImage && (
                        <p className="truncate text-xs text-slate-500">
                          {editImage.name}
                        </p>
                      )}

                      {/* Save/cancel */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateRecipe(recipe.id)}
                          disabled={isSubmitting}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                          <Save size={14} />
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                          aria-label="Cancel editing"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="truncate text-sm font-semibold text-slate-900">
                        {recipe.name}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        {recipe.categoryName}
                      </p>

                      <p className="mt-2 text-base font-bold text-slate-900">
                        {formatPrice(recipe.price)}
                      </p>

                      {/* Ingredients */}
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <p className="mb-1 text-xs font-semibold text-slate-600">
                          Ingredients
                        </p>

                        <p className="line-clamp-3 text-xs leading-5 text-slate-500">
                          {recipe.ingredients?.join(", ")}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => startEditing(recipe)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 transition hover:text-indigo-800"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRecipe(recipe)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 transition hover:text-red-800"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
