import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { databaseRequest } from "../../firebase";

import {
  saveCategoryImage,
  getCategoryImage,
  getCategoryImageBlob,
  deleteCategoryImage as removeLocalImage,
} from "../../utils/categoryImageDB";

// Fetch categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, thunkAPI) => {
    try {
      const authToken = thunkAPI.getState().auth.idToken;

      const data = await databaseRequest("categories", {
        authToken,
      });

      if (!data) return [];

      const categories = await Promise.all(
        Object.entries(data).map(async ([id, category]) => {
          let imageUrl = null;

          if (category.hasImage) {
            imageUrl = await getCategoryImage(id);
          }

          return {
            id,
            ...category,
            imageUrl,
          };
        }),
      );

      return categories;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Add category
export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async ({ name, imageFile }, thunkAPI) => {
    let createdCategoryId = null;

    try {
      const authToken = thunkAPI.getState().auth.idToken;

      if (!authToken) {
        throw new Error("Please log in again. Your session has expired.");
      }

      if (!name.trim()) {
        throw new Error("Category name is required.");
      }

      if (!imageFile) {
        throw new Error("Please select a category image.");
      }

      const category = {
        name: name.trim(),
        hasImage: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save category metadata in Firebase
      const result = await databaseRequest("categories", {
        method: "POST",
        body: category,
        authToken,
      });

      createdCategoryId = result.name;

      // Save image locally in IndexedDB
      const imageUrl = await saveCategoryImage(createdCategoryId, imageFile);

      return {
        id: createdCategoryId,
        ...category,
        imageUrl,
      };
    } catch (error) {
      // Roll back Firebase entry if local image storage fails
      if (createdCategoryId) {
        try {
          await databaseRequest(`categories/${createdCategoryId}`, {
            method: "DELETE",
            authToken: thunkAPI.getState().auth.idToken,
          });
        } catch (rollbackError) {
          console.error("Category rollback failed:", rollbackError);
        }
      }

      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Update category
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, name, imageFile }, thunkAPI) => {
    try {
      const authToken = thunkAPI.getState().auth.idToken;

      if (!authToken) {
        throw new Error("Please log in again. Your session has expired.");
      }

      if (!name.trim()) {
        throw new Error("Category name cannot be empty.");
      }

      const existingCategory = thunkAPI
        .getState()
        .categories.items.find((item) => item.id === id);

      if (!existingCategory) {
        throw new Error("Category not found.");
      }

      const updatedData = {
        name: name.trim(),
        updatedAt: Date.now(),
      };

      if (imageFile) {
        updatedData.hasImage = true;
      }

      // Update metadata in Firebase
      await databaseRequest(`categories/${id}`, {
        method: "PATCH",
        body: updatedData,
        authToken,
      });

      let imageUrl = existingCategory.imageUrl;

      // Replace image in IndexedDB if a new image was selected
      if (imageFile) {
        const oldBlob = await getCategoryImageBlob(id);

        try {
          imageUrl = await saveCategoryImage(id, imageFile);
        } catch (imageError) {
          // Restore the previous Firebase category name if image saving fails
          await databaseRequest(`categories/${id}`, {
            method: "PATCH",
            body: {
              name: existingCategory.name,
              updatedAt: existingCategory.updatedAt,
            },
            authToken,
          });

          throw imageError;
        }

        if (existingCategory.imageUrl) {
          URL.revokeObjectURL(existingCategory.imageUrl);
        }

        // The old blob is retained in IndexedDB until replacement succeeds.
        // saveCategoryImage replaces the existing record atomically.
        void oldBlob;
      }

      return {
        ...existingCategory,
        ...updatedData,
        id,
        imageUrl,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Delete category
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, thunkAPI) => {
    try {
      const authToken = thunkAPI.getState().auth.idToken;

      if (!authToken) {
        throw new Error("Please log in again. Your session has expired.");
      }

      const category = thunkAPI
        .getState()
        .categories.items.find((item) => item.id === id);

      // Delete metadata from Firebase
      await databaseRequest(`categories/${id}`, {
        method: "DELETE",
        authToken,
      });

      // Delete image from IndexedDB
      try {
        await removeLocalImage(id);
      } catch (imageError) {
        console.warn("Unable to remove local category image:", imageError);
      }

      if (category?.imageUrl) {
        URL.revokeObjectURL(category.imageUrl);
      }

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const initialState = {
  items: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  status: "idle",
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,

  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.status = "failed";
        state.error = action.payload;
      })

      // Add category
      .addCase(addCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;

        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoryError } = categoriesSlice.actions;

export default categoriesSlice.reducer;
