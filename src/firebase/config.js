const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;

if (!apiKey || !databaseURL) {
  throw new Error("Firebase environment variables are missing");
}

export const firebaseConfig = {
  apiKey,
  databaseURL: databaseURL.replace(/\/$/, ""),
};

export const AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1";
