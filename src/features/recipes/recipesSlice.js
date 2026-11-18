import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { databaseRequest } from "../../firebase";

import {
  saveRecipeImage,
  getRecipeImage,
  deleteRecipeImage as removeLocalImage,
} from "../../utils/recipeImageDB";

// Fetch recipes.
export const fetchRecipes = createAsyncThunk(
  "recipes/fetchRecipes",
  async (_, thunkAPI) => {
    try {
      const authToken = thunkAPI.getState().auth.idToken;

      const data = await databaseRequest("recipes", {
        authToken,
      });

      if (!data) return [];

      const recipes = await Promise.all(
        Object.entries(data).map(async ([id, recipe]) => {
          let imageUrl = null;

          if (recipe.hasImage) {
            imageUrl = await getRecipeImage(id);
          }

          return {
            id,
            ...recipe,
            imageUrl,
          };
        }),
      );

      return recipes;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Add recipe.
export const addRecipe = createAsyncThunk(
  "recipes/addRecipe",
  async ({ name, categoryId, ingredients, price, imageFile }, thunkAPI) => {
    let createdRecipeId = null;

    try {
      const authToken = thunkAPI.getState().auth.idToken;

      if (!authToken) {
        throw new Error("Please log in again. Your session has expired.");
      }

      if (!name.trim()) {
        throw new Error("Recipe name is required.");
      }

      if (!categoryId) {
        throw new Error("Please select a category.");
      }

      if (!ingredients.length || ingredients.some((item) => !item.trim())) {
        throw new Error("Please enter all ingredients.");
      }

      if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        throw new Error("Please enter a valid non-negative price.");
      }

      if (!imageFile) {
        throw new Error("Please select a recipe image.");
      }

      const selectedCategory = thunkAPI
        .getState()
        .categories.items.find((category) => category.id === categoryId);

      if (!selectedCategory) {
        throw new Error("Selected category was not found.");
      }

      const recipe = {
        name: name.trim(),
        categoryId,
        categoryName: selectedCategory.name,
        ingredients: ingredients.map((item) => item.trim()),
        price: Number(price),
        hasImage: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save metadata to Firebase.
      const result = await databaseRequest("recipes", {
        method: "POST",
        body: recipe,
        authToken,
      });

      createdRecipeId = result.name;

      // Save image to IndexedDB.
      const imageUrl = await saveRecipeImage(createdRecipeId, imageFile);

      return {
        id: createdRecipeId,
        ...recipe,
        imageUrl,
      };
    } catch (error) {
      // Roll back Firebase record if image storage fails.
      if (createdRecipeId) {
        try {
          await databaseRequest(`recipes/${createdRecipeId}`, {
            method: "DELETE",
            authToken: thunkAPI.getState().auth.idToken,
          });
        } catch (rollbackError) {
          console.error("Recipe rollback failed:", rollbackError);
        }
      }

      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Update recipe.
export const updateRecipe = createAsyncThunk(
  "recipes/updateRecipe",
  async ({ id, name, categoryId, ingredients, price, imageFile }, thunkAPI) => {
    try {
      const authToken = thunkAPI.getState().auth.idToken;

      if (!authToken) {
        throw new Error("Please log in again. Your session has expired.");
      }

      if (!name.trim()) {
        throw new Error("Recipe name cannot be empty.");
      }

      if (!categoryId) {
        throw new Error("Please select a category.");
      }

      if (!ingredients.length || ingredients.some((item) => !item.trim())) {
        throw new Error("Please enter all ingredients.");
      }

      if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        throw new Error("Please enter a valid non-negative price.");
      }

      const existingRecipe = thunkAPI
        .getState()
        .recipes.items.find((item) => item.id === id);

      if (!existingRecipe) {
        throw new Error("Recipe not found.");
      }

      const selectedCategory = thunkAPI
        .getState()
        .categories.items.find((category) => category.id === categoryId);

      if (!selectedCategory) {
        throw new Error("Selected category was not found.");
      }

      const updatedData = {
        name: name.trim(),
        categoryId,
        categoryName: selectedCategory.name,
        ingredients: ingredients.map((item) => item.trim()),
        price: Number(price),
        updatedAt: Date.now(),
      };

      if (imageFile) {
        updatedData.hasImage = true;
      }

      // Update metadata in Firebase.
      await databaseRequest(`recipes/${id}`, {
        method: "PATCH",
        body: updatedData,
        authToken,
      });

      let imageUrl = existingRecipe.imageUrl;

      // Update local image only if a new image was selected.
      if (imageFile) {
        imageUrl = await saveRecipeImage(id, imageFile);

        if (existingRecipe.imageUrl) {
          URL.revokeObjectURL(existingRecipe.imageUrl);
        }
      }

      return {
        ...existingRecipe,
        ...updatedData,
        id,
        imageUrl,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Delete recipe.
export const deleteRecipe = createAsyncThunk(
  "recipes/deleteRecipe",
  async (id, thunkAPI) => {
    try {
      const authToken = thunkAPI.getState().auth.idToken;

      if (!authToken) {
        throw new Error("Please log in again. Your session has expired.");
      }

      const recipe = thunkAPI
        .getState()
        .recipes.items.find((item) => item.id === id);

      // Delete Firebase metadata.
      await databaseRequest(`recipes/${id}`, {
        method: "DELETE",
        authToken,
      });

      // Delete IndexedDB image.
      try {
        await removeLocalImage(id);
      } catch (imageError) {
        console.warn("Unable to remove local recipe image:", imageError);
      }

      if (recipe?.imageUrl) {
        URL.revokeObjectURL(recipe.imageUrl);
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

const recipesSlice = createSlice({
  name: "recipes",
  initialState,

  reducers: {
    clearRecipeError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch recipes.
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.status = "failed";
        state.error = action.payload;
      })

      // Add recipe.
      .addCase(addRecipe.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(addRecipe.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items.push(action.payload);
      })
      .addCase(addRecipe.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Update recipe.
      .addCase(updateRecipe.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.isSubmitting = false;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Delete recipe.
      .addCase(deleteRecipe.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.isSubmitting = false;

        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecipeError } = recipesSlice.actions;

export default recipesSlice.reducer;
