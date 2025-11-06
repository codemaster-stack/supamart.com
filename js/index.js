document.getElementById('shopNowBtn').addEventListener('click', () => {
  alert("Shop Now clicked!");
});

// Show placeholder products first
function displayPlaceholderProducts() {
  const main = document.querySelector('main');
  const section = document.createElement('section');
  section.className = "product-list";

  for (let i = 1; i <= 4; i++) {
    const div = document.createElement('div');
    div.className = "product";
    div.innerHTML = `<h3>Product ${i}</h3><p>Price: ₦--</p>`;
    section.appendChild(div);
  }

  main.appendChild(section);
}

// Load real products from backend when available
async function loadLandingProducts() {
  showLoading();
  try {
    const products = await getProducts(); // call api.js function
    displayProducts(products);            // function in index.js to render products
  } finally {
    hideLoading();
  }
}

// For now, show placeholders
displayPlaceholderProducts();
