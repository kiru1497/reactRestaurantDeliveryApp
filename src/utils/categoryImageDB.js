const DB_NAME = "RestaurantDeliveryDB";
const DB_VERSION = 2;
const STORE_NAME = "categoryImages";

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

// Save category image.
export const saveCategoryImage = async (categoryId, file) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put({
      categoryId,
      image: file,
      updatedAt: Date.now(),
    });

    transaction.oncomplete = () => {
      db.close();
      resolve(URL.createObjectURL(file));
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("Unable to save image."));
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error("Image storage was interrupted."));
    };
  });
};

// Retrieve category image.
export const getCategoryImage = async (categoryId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(categoryId);

    request.onsuccess = () => {
      const record = request.result;

      if (record?.image) {
        resolve(URL.createObjectURL(record.image));
      } else {
        resolve(null);
      }
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

// Retrieve original category image Blob.
export const getCategoryImageBlob = async (categoryId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(categoryId);

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

// Delete category image.
export const deleteCategoryImage = async (categoryId) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(categoryId);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("Unable to delete image."));
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error("Image deletion was interrupted."));
    };
  });
};
