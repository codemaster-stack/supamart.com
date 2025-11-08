document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('header nav ul');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    // Show placeholder products
    function displayPlaceholderProducts() {
        const main = document.querySelector('main');
        if (!main) return;
        
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

    // Load placeholders
    displayPlaceholderProducts();

    // Shop Now button scroll
    const shopNowBtn = document.getElementById('shopNowBtn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            const productSection = document.querySelector('.product-list');
            if(productSection) {
                window.scrollTo({ top: productSection.offsetTop, behavior:'smooth' });
            }
        });
    }
});