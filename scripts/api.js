const API_BASE_URL = "https://your-backend-domain.com/api";

// Fetch products from backend
async function getProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch products", err);
    return [];
  }
}

// You can add more API functions here, e.g., loginUser, registerUser, etc.
