import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Tags,
  Upload,
  Pencil,
  Trash2,
  X,
  Save,
  LoaderCircle,
  ImagePlus,
} from "lucide-react";

import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  clearCategoryError,
} from "../../features/categories/categoriesSlice";

function CategoryImage({ src, alt }) {
  return (
    <div className="flex h-44 w-full items-center justify-center overflow-hidden bg-slate-100">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <ImagePlus size={32} />
          <span className="text-xs">Image unavailable in this browser</span>
        </div>
      )}
    </div>
  );
}

export default function AdminCategories() {
  const dispatch = useDispatch();

  const {
    items: categories,
    isLoading,
    isSubmitting,
    error,
    status,
  } = useSelector((state) => state.categories);

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");

  const addImageInputRef = useRef(null);
  const editImageInputRef = useRef(null);

  // Fetch categories when the page is first opened.
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, status]);

  // Clean up the temporary image preview URL.
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (editImagePreview) {
        URL.revokeObjectURL(editImagePreview);
      }
    };
  }, [editImagePreview]);

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

  // Select image for a new category.
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file || !validateImage(file)) return;

    setCategoryImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Select replacement image while editing.
  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file || !validateImage(file)) return;

    setEditImage(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  // Add category.
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Please enter a category name.");
      return;
    }

    if (!categoryImage) {
      alert("Please select a category image.");
      return;
    }

    try {
      await dispatch(
        addCategory({
          name: categoryName,
          imageFile: categoryImage,
        }),
      ).unwrap();

      setCategoryName("");
      setCategoryImage(null);
      setImagePreview("");

      if (addImageInputRef.current) {
        addImageInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Unable to add category:", error);
    }
  };

  // Start editing a category.
  const startEditing = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditImage(null);
    setEditImagePreview("");

    dispatch(clearCategoryError());
  };

  // Cancel editing.
  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditImage(null);
    setEditImagePreview("");

    if (editImageInputRef.current) {
      editImageInputRef.current.value = "";
    }
  };

  // Save category changes.
  const handleUpdateCategory = async (id) => {
    if (!editName.trim()) {
      alert("Category name cannot be empty.");
      return;
    }

    try {
      await dispatch(
        updateCategory({
          id,
          name: editName,
          imageFile: editImage,
        }),
      ).unwrap();

      cancelEditing();
    } catch (error) {
      console.error("Unable to update category:", error);
    }
  };

  // Delete category.
  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      await dispatch(deleteCategory(category.id)).unwrap();
    } catch (error) {
      console.error("Unable to delete category:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Page title */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Categories
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your restaurant food categories.
        </p>
      </div>

      {/* Add new category */}
      <section className="mb-7 rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-5 text-base font-semibold text-slate-900">
          Add New Category
        </h3>

        <form onSubmit={handleAddCategory} className="space-y-4">
          {/* Category name */}
          <div>
            <label
              htmlFor="categoryName"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Category Name
            </label>

            <input
              id="categoryName"
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Category image */}
          <div>
            <label
              htmlFor="categoryImage"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Category Image
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="categoryImage"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Upload size={15} />
                Choose File
              </label>

              <input
                ref={addImageInputRef}
                id="categoryImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />

              <span className="max-w-full truncate text-xs text-slate-500">
                {categoryImage ? categoryImage.name : "No file chosen"}
              </span>
            </div>

            {imagePreview && (
              <div className="mt-4 h-28 w-40 overflow-hidden rounded-lg border border-slate-200">
                <img
                  src={imagePreview}
                  alt="Category preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <p className="mt-2 text-xs text-slate-400">
              Select an image up to 5 MB. Images are stored in this browser.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Add button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Adding Category...
              </>
            ) : (
              "Add Category"
            )}
          </button>
        </form>
      </section>

      {/* Existing categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Existing Categories
          </h3>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {categories.length} Categories
          </span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
            <LoaderCircle size={19} className="animate-spin" />
            Loading categories...
          </div>
        )}

        {/* Fetch error */}
        {!isLoading && status === "failed" && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            <p>{error || "Unable to load categories."}</p>

            <button
              type="button"
              onClick={() => dispatch(fetchCategories())}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && status === "succeeded" && categories.length === 0 && (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-4 text-center">
            <Tags size={30} className="mb-3 text-slate-300" />

            <p className="text-sm font-semibold text-slate-700">
              No categories added yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Add your first food category using the form above.
            </p>
          </div>
        )}

        {/* Category cards */}
        {!isLoading && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <article
                key={category.id}
                className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <CategoryImage
                  src={
                    editingId === category.id && editImagePreview
                      ? editImagePreview
                      : category.imageUrl
                  }
                  alt={category.name}
                />

                <div className="p-4">
                  {editingId === category.id ? (
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-slate-700">
                        Category Name
                      </label>

                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />

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

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(category.id)}
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
                        {category.name}
                      </h4>

                      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => startEditing(category)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 transition hover:text-indigo-800"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category)}
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
