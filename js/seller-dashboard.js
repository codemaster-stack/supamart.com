// seller-dashboard.js - Connected to Backend

const API_URL = 'https://api-supamart.onrender.com/api';
let currentSeller = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initSidebar();
    initNavigation();
    loadSellerData();
});

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'seller') {
        alert('Unauthorized! Seller access only.');
        window.location.href = '/login.html';
        return false;
    }
    
    return true;
}

// Get Auth Headers
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

// Sidebar Toggle
function initSidebar() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const widgetLinks = document.querySelectorAll('.widget-link');
    
    // Sidebar navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.querySelector('a').getAttribute('href').substring(1);
            
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            item.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                const title = targetSection.querySelector('h3');
                if (title) {
                    document.querySelector('.seller-header h2').textContent = title.textContent;
                }
                
                loadSectionData(targetId);
            }
            
            document.querySelector('.dashboard-sidebar')?.classList.remove('open');
            
            if (targetId === 'logout') {
                handleLogout();
            }
        });
    });
    
    // Widget link navigation
    widgetLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                sections.forEach(s => s.classList.remove('active'));
                targetSection.classList.add('active');
                
                const title = targetSection.querySelector('h3');
                if (title) {
                    document.querySelector('.seller-header h2').textContent = title.textContent;
                }
                
                navItems.forEach(n => n.classList.remove('active'));
                const matchingNav = document.querySelector(`.sidebar-nav a[href="${href}"]`);
                if (matchingNav) {
                    matchingNav.parentElement.classList.add('active');
                }
                
                loadSectionData(targetId);
            }
        });
    });
    
    // Activate first item
    navItems[0]?.click();
}

// Load Seller Data
async function loadSellerData() {
    try {
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.show('Loading your dashboard...');
        }
        
        // Get seller info from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        currentSeller = user;
        
        if (!user || !user.id) {
            throw new Error('Seller data not found');
        }
        
        // Fetch seller details from backend
        const response = await fetch(`${API_URL}/sellers/${user.id}`, {
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success) {
            updateSellerUI(result.seller);
            await loadDashboardStats(result.seller);
            setupStoreLink(result.seller);
        }
        
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
    } catch (error) {
        console.error('Error loading seller data:', error);
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
    }
}

// Update Seller UI
function updateSellerUI(seller) {
    document.getElementById('store-name').textContent = seller.storeName;
    document.getElementById('store-name-sidebar').textContent = seller.storeName;
    document.getElementById('seller-name').textContent = seller.fullName;
    
    if (seller.storeLogo) {
        document.getElementById('store-logo').src = seller.storeLogo;
        document.getElementById('seller-avatar').src = seller.storeLogo;
    }
}

// Setup Store Link
function setupStoreLink(seller) {
    const storeLink = `${window.location.origin}/seller-shop.html?shop=${seller.shopURL}`;
    document.getElementById('store-link-input').value = storeLink;
}

// Copy Store Link
function copyStoreLink() {
    const input = document.getElementById('store-link-input');
    input.select();
    document.execCommand('copy');
    
    alert('Store link copied to clipboard!');
}

// Share Store Link
function shareStoreLink() {
    const storeLink = document.getElementById('store-link-input').value;
    const storeName = document.getElementById('store-name').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: storeName,
            text: `Check out my store: ${storeName}`,
            url: storeLink
        }).catch(err => console.log('Share cancelled'));
    } else {
        // Fallback options
        const shareOptions = `
            <div style="padding: 20px;">
                <h3>Share Your Store</h3>
                <div style="margin: 20px 0;">
                    <a href="https://wa.me/?text=${encodeURIComponent(storeName + ': ' + storeLink)}" target="_blank" 
                       style="display: inline-block; margin: 5px; padding: 10px 20px; background: #25D366; color: white; text-decoration: none; border-radius: 5px;">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeLink)}" target="_blank"
                       style="display: inline-block; margin: 5px; padding: 10px 20px; background: #1877F2; color: white; text-decoration: none; border-radius: 5px;">
                        <i class="fab fa-facebook"></i> Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(storeName)}&url=${encodeURIComponent(storeLink)}" target="_blank"
                       style="display: inline-block; margin: 5px; padding: 10px 20px; background: #1DA1F2; color: white; text-decoration: none; border-radius: 5px;">
                        <i class="fab fa-twitter"></i> Twitter
                    </a>
                </div>
            </div>
        `;
        
        // Show in a modal or alert
        const modal = window.open('', 'Share', 'width=500,height=400');
        modal.document.write(shareOptions);
    }
}

// Make functions global
window.copyStoreLink = copyStoreLink;
window.shareStoreLink = shareStoreLink;

// Load Dashboard Stats
async function loadDashboardStats(seller) {
    try {
        // Load wallet balances
        updateWallets(seller.wallets);
        
        // Load other stats (you'll implement these API endpoints)
        // const stats = await fetch(`${API_URL}/sellers/${seller._id}/stats`, {
        //     headers: getAuthHeaders()
        // });
        
        // For now, using dummy data
        document.getElementById('total-sales').textContent = '$5,432.10';
        document.getElementById('pending-orders').textContent = '15';
        document.getElementById('active-products').textContent = '75';
        document.getElementById('available-balance').textContent = 
            `$${seller.wallets?.USD?.balance || 0}`;
        
        // Load recent orders
        await loadRecentOrders(seller._id);
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update Wallets
function updateWallets(wallets) {
    if (!wallets) return;
    
    // USD
    document.getElementById('wallet-usd').textContent = 
        `$${(wallets.USD?.balance || 0).toLocaleString()}`;
    document.getElementById('wallet-usd-pending').textContent = 
        `$${(wallets.USD?.pendingBalance || 0).toLocaleString()}`;
    
    // GBP
    document.getElementById('wallet-gbp').textContent = 
        `£${(wallets.GBP?.balance || 0).toLocaleString()}`;
    document.getElementById('wallet-gbp-pending').textContent = 
        `£${(wallets.GBP?.pendingBalance || 0).toLocaleString()}`;
    
    // EUR
    document.getElementById('wallet-eur').textContent = 
        `€${(wallets.EUR?.balance || 0).toLocaleString()}`;
    document.getElementById('wallet-eur-pending').textContent = 
        `€${(wallets.EUR?.pendingBalance || 0).toLocaleString()}`;
    
    // NGN
    document.getElementById('wallet-ngn').textContent = 
        `₦${(wallets.NGN?.balance || 0).toLocaleString()}`;
    document.getElementById('wallet-ngn-pending').textContent = 
        `₦${(wallets.NGN?.pendingBalance || 0).toLocaleString()}`;
}

// Load Recent Orders
async function loadRecentOrders(sellerId) {
    try {
        // This endpoint needs to be created in backend
        // const response = await fetch(`${API_URL}/sellers/${sellerId}/orders/recent`, {
        //     headers: getAuthHeaders()
        // });
        
        // For now, show message
        const tbody = document.getElementById('recent-orders-tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">
                    No recent orders. Start selling!
                </td>
            </tr>
        `;
    } catch (error) {
        console.error('Error loading recent orders:', error);
    }
}

// Load Section Data
async function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'seller-orders':
            await loadAllOrders();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'sales-reports':
            initSalesChart();
            break;
    }
}

// Load All Orders
async function loadAllOrders() {
    const tbody = document.getElementById('all-orders-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No orders yet.</td></tr>';
}

// Load Products
async function loadProducts() {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No products yet.</td></tr>';
}

// Initialize Sales Chart
function initSalesChart() {
    const canvas = document.getElementById('salesOverviewChart');
    if (!canvas) return;
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Sales ($)',
                data: [1200, 1900, 800, 1500, 2000, 2400],
                backgroundColor: 'rgba(40, 167, 69, 0.6)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login.html';
    }
}