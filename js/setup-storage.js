const { Client, Storage } = require("appwrite");

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6818b62c00111bdfae58"); // your project ID ✅

const storage = new Storage(client);

async function createBucket() {
  try {
    const response = await storage.createBucket(
      "media", // Bucket ID
      "media", // Name
      ["role:all"], // Read permissions
      ["role:all"]  // Write permissions
    );
    console.log("✅ Bucket 'media' created successfully:", response);
  } catch (err) {
    console.error("❌ Error creating bucket:", err.message);
  }
}

createBucket();
