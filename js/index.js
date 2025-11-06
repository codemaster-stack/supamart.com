// Shop Now button scroll
document.getElementById('shopNowBtn').addEventListener('click', () => {
  const productSection = document.querySelector('.product-list');
  if(productSection) {
    window.scrollTo({ top: productSection.offsetTop, behavior:'smooth' });
  }
});

// Show placeholder products
function displayPlaceholderProducts() {
  const main = document.querySelector('main');
  const section = document.createElement('section');
  section.className = "product-list";

  for(let i=1; i<=4; i++) {
    const div = document.createElement('div');
    div.className = "product";
    div.innerHTML = `<h3>Product ${i}</h3><p>Price: ₦--</p>`;
    section.appendChild(div);
  }

  main.appendChild(section);
}

// Load placeholders on page load
displayPlaceholderProducts();
