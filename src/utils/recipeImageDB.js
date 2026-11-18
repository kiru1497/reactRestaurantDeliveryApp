const DB_NAME = "RestaurantDeliveryDB";
const DB_VERSION = 2;
const STORE_NAME = "recipeImages";

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Your browser does not support IndexedDB."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("categoryImages")) {
        db.createObjectStore("categoryImages", {
          keyPath: "categoryId",
        });
      }

      if (!db.objectStoreNames.contains("recipeImages")) {
        db.createObjectStore("recipeImages", {
          keyPath: "recipeId",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      reject(request.error || new Error("Unable to open IndexedDB."));
    };
  });
};

// Save or replace recipe image.
export const saveRecipeImage = async (recipeId, file) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put({
      recipeId,
      image: file,
      updatedAt: Date.now(),
    });

    transaction.oncomplete = () => {
      db.close();
      resolve(URL.createObjectURL(file));
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("Unable to save recipe image."));
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error("Image storage was interrupted."));
    };
  });
};

// Retrieve recipe image URL.
export const getRecipeImage = async (recipeId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(recipeId);

    request.onsuccess = () => {
      const record = request.result;

      if (record?.image) {
        resolve(URL.createObjectURL(record.image));
      } else {
        resolve(null);
      }
    };

    request.onerror = () => {
      reject(request.error || new Error("Unable to retrieve recipe image."));
    };

    transaction.oncomplete = () => db.close();

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

// Retrieve original Blob.
export const getRecipeImageBlob = async (recipeId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(recipeId);

    request.onsuccess = () => {
      resolve(request.result?.image || null);
    };

    request.onerror = () => {
      reject(request.error || new Error("Unable to retrieve image."));
    };

    transaction.oncomplete = () => db.close();

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

// Delete recipe image.
export const deleteRecipeImage = async (recipeId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(recipeId);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("Unable to delete recipe image."));
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error("Image deletion was interrupted."));
    };
  });
};
