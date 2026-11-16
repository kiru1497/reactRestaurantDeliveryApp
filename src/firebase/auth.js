import { firebaseConfig, AUTH_BASE_URL } from "./config";

const authRequest = async (endpoint, body) => {
  try {
    const response = await fetch(
      `${AUTH_BASE_URL}/${endpoint}?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Authentication failed");
    }

    return data;
  } catch (error) {
    console.error("Authentication Error:", error.message);
    throw error;
  }
};

// Register a new user
export const signUpWithEmail = (email, password) => {
  return authRequest("accounts:signUp", {
    email,
    password,
    returnSecureToken: true,
  });
};

// Login an existing user
export const signInWithEmail = (email, password) => {
  return authRequest("accounts:signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });
};

// Send password reset email
export const sendPasswordResetEmail = (email) => {
  return authRequest("accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
  });
};

// Retrieve authenticated account information
export const getAccountInfo = (idToken) => {
  return authRequest("accounts:lookup", {
    idToken,
  });
};

// Refresh expired ID token
export const refreshAuthToken = async (refreshToken) => {
  try {
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Token refresh failed");
    }

    return data;
  } catch (error) {
    console.error("Token Refresh Error:", error.message);
    throw error;
  }
};
