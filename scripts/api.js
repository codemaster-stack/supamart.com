const API_BASE_URL = "https://your-backend-domain.com/api";

// Example: getProducts (backend)
async function getProducts() {
  showLoading();
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    return await res.json();
  } catch(err) {
    console.error("Failed to fetch products", err);
    return [];
  } finally {
    hideLoading();
  }
}
