import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  signUpWithEmail,
  signInWithEmail,
  databaseRequest,
} from "../../firebase";

// Register customer
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ firstName, fullName, email, password }, thunkAPI) => {
    try {
      const authData = await signUpWithEmail(email, password);

      const user = {
        uid: authData.localId,
        firstName,
        fullName,
        email: authData.email,
        role: "user",
      };

      await databaseRequest(`users/${authData.localId}`, {
        method: "PUT",
        body: {
          firstName,
          fullName,
          email: authData.email,
          role: "user",
        },
        authToken: authData.idToken,
      });

      return {
        user,
        idToken: authData.idToken,
        refreshToken: authData.refreshToken,
        expiresIn: Number(authData.expiresIn),
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Customer login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const authData = await signInWithEmail(email, password);

      const profile = await databaseRequest(`users/${authData.localId}`, {
        authToken: authData.idToken,
      });

      if (!profile || profile.role !== "user") {
        throw new Error("Customer account not found.");
      }

      return {
        user: {
          uid: authData.localId,
          ...profile,
        },
        idToken: authData.idToken,
        refreshToken: authData.refreshToken,
        expiresIn: Number(authData.expiresIn),
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Admin login
export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async ({ email, password }, thunkAPI) => {
    try {
      const authData = await signInWithEmail(email, password);

      const adminStatus = await databaseRequest(`admins/${authData.localId}`, {
        authToken: authData.idToken,
      });

      if (adminStatus !== true) {
        throw new Error("You are not authorized as an administrator.");
      }

      return {
        user: {
          uid: authData.localId,
          email: authData.email,
          role: "admin",
        },
        idToken: authData.idToken,
        refreshToken: authData.refreshToken,
        expiresIn: Number(authData.expiresIn),
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Initial authentication state
const initialState = {
  user: null,
  idToken: null,
  refreshToken: null,
  expiresIn: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    logout: (state) => {
      state.user = null;
      state.idToken = null;
      state.refreshToken = null;
      state.expiresIn = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Registration
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.idToken = action.payload.idToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Customer login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.idToken = action.payload.idToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Admin login
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.idToken = action.payload.idToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError, logout } = authSlice.actions;

export default authSlice.reducer;
