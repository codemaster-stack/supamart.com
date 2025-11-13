// seller-shop.js - Load seller shop and products

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Seller shop page loaded');
    
    // Get shop URL from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const shopURL = urlParams.get('shop');
    
    console.log('Shop URL from URL:', shopURL);
    
    if (!shopURL) {
        showError('No shop specified in URL');
        return;
    }
    
    await loadShop(shopURL);
});

async function loadShop(shopURL) {
    try {
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.show('Loading shop...');
        }
        
        console.log('Fetching shop data for:', shopURL);
        
        const response = await fetch(`https://api-supamart.onrender.com/api/products/seller/${shopURL}`);
        const result = await response.json();
        
        console.log('Shop data received:', result);
        
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        
        if (result.success) {
            displayShopInfo(result.seller);
            displayProducts(result.products);
        } else {
            showError('Shop not found');
        }
    } catch (error) {
        console.error('Error loading shop:', error);
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        showError('Failed to load shop. Please check your connection.');
    }
}

function displayShopInfo(seller) {
    console.log('Displaying shop info:', seller);
    
    document.getElementById('shop-logo').src = seller.storeLogo || 'assets/images/placeholder.png';
    document.getElementById('shop-name').textContent = seller.storeName;
    document.getElementById('shop-description').textContent = seller.storeDescription || 'Welcome to our shop!';
    document.title = `${seller.storeName} - Supamart`;
}

function displayProducts(products) {
    console.log('Displaying products:', products.length);
    
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div class="empty-shop">
                <i class="fas fa-box-open"></i>
                <h3>No products available yet</h3>
                <p>This shop hasn't listed any products yet. Check back soon!</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const imageUrl = (product.images && product.images[0]) ? product.images[0].url : 'assets/images/placeholder.png';
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${product.name}" 
                 onerror="this.src='assets/images/placeholder.png'">
            <h3>${product.name}</h3>
            <p class="price" 
               data-price="${product.price.amount}" 
               data-currency="${product.price.currency}">
                ${product.price.currency} ${product.price.amount.toFixed(2)}
            </p>
            <button onclick="viewProduct('${product._id}')">
                <i class="fas fa-eye"></i> View Details
            </button>
        `;
        grid.appendChild(card);
    });
    
    // Convert prices after loading
    setTimeout(async () => {
        if (typeof currencyConverter !== 'undefined') {
            console.log('Converting prices...');
            await currencyConverter.convertAllPrices();
        }
    }, 200);
}

function shareShop() {
    const shopURL = window.location.href;
    const shopName = document.getElementById('shop-name').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: shopName,
            text: `Check out ${shopName} on Supamart!`,
            url: shopURL
        }).catch(err => console.log('Share cancelled'));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shopURL).then(() => {
            alert('Shop link copied to clipboard! Share it with your friends.');
        }).catch(() => {
            prompt('Copy this link:', shopURL);
        });
    }
}

function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function showError(message) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = `
        <div class="empty-shop">
            <i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i>
            <h3 style="color: #dc3545;">Error</h3>
            <p>${message}</p>
            <button onclick="window.location.href='index.html'" 
                    style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Go to Home
            </button>
        </div>
    `;
}
