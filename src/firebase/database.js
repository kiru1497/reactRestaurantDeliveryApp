import { firebaseConfig } from "./config";

export const databaseRequest = async (
  path,
  { method = "GET", body, authToken } = {},
) => {
  try {
    const endpoint = `${firebaseConfig.databaseURL}/${path}.json`;

    const url = new URL(endpoint);

    // Attach Firebase authentication token when available
    if (authToken) {
      url.searchParams.set("auth", authToken);
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Firebase database request failed");
    }

    return data;
  } catch (error) {
    console.error("Database Error:", error.message);
    throw error;
  }
};
