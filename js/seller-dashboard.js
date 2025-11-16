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
        case 'store-settings':  // ✅ ADD THIS CASE
            loadStoreSettings();
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


// ========== ADD PRODUCT ==========
function openAddProductModal() {
    document.getElementById('add-product-modal').classList.add('active');
}

function closeAddProductModal() {
    document.getElementById('add-product-modal').classList.remove('active');
    document.getElementById('add-product-form').reset();
}

// Make global
window.openAddProductModal = openAddProductModal;
window.closeAddProductModal = closeAddProductModal;

// Handle Add Product Form
document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.show('Adding product...');
        }
        
        const formData = new FormData(e.target);
        
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        
        if (result.success) {
            alert('Product added successfully!');
            closeAddProductModal();
            loadProducts(); // Reload products list
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        alert('Failed to add product');
    }
});

// ========== REQUEST PAYOUT ==========
function openPayoutModal() {
    document.getElementById('payout-modal').classList.add('active');
    loadBankAccounts();
}

function closePayoutModal() {
    document.getElementById('payout-modal').classList.remove('active');
    document.getElementById('payout-form').reset();
}

window.openPayoutModal = openPayoutModal;
window.closePayoutModal = closePayoutModal;

// Update available balance when currency changes
function updatePayoutAmount() {
    const currency = document.getElementById('payout-currency').value;
    if (!currency || !currentSeller) return;
    
    const balance = currentSeller.wallets?.[currency]?.balance || 0;
    const symbols = { USD: '$', GBP: '£', EUR: '€', NGN: '₦' };
    
    document.getElementById('payout-available-balance').textContent = 
        `${symbols[currency]}${balance.toLocaleString()}`;
    
    document.getElementById('payout-amount').max = balance;
}

window.updatePayoutAmount = updatePayoutAmount;

// Load Bank Accounts
async function loadBankAccounts() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(`${API_URL}/sellers/${user.id}`, {
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success && result.seller.bankAccounts) {
            const select = document.getElementById('payout-account');
            select.innerHTML = '<option value="">Select Bank Account</option>';
            
            result.seller.bankAccounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account._id;
                option.textContent = `${account.bankName} - ${account.accountNumber} (${account.currency})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading bank accounts:', error);
    }
}

// Handle Payout Request
document.getElementById('payout-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.show('Processing payout request...');
        }
        
        const formData = new FormData(e.target);
        const payoutData = {
            currency: formData.get('currency'),
            amount: parseFloat(formData.get('amount')),
            accountId: formData.get('accountId')
        };
        
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(`${API_URL}/sellers/${user.id}/payout`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payoutData)
        });
        
        const result = await response.json();
        
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        
        if (result.success) {
            alert('Payout request submitted successfully!');
            closePayoutModal();
            loadSellerData(); // Reload to update balances
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error requesting payout:', error);
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        alert('Failed to request payout');
    }
});

// ========== STORE SETTINGS ==========

// Load Store Settings
// Load Store Settings
function loadStoreSettings() {
    if (!currentSeller) return;
    
    document.getElementById('settings-store-name').value = currentSeller.storeName || '';
    document.getElementById('settings-store-description').value = currentSeller.storeDescription || '';
    document.getElementById('settings-phone').value = currentSeller.phoneNumber || '';
    
    // Load current logo in settings
    if (currentSeller.storeLogo) {
        const currentLogoImg = document.getElementById('current-store-logo');
        if (currentLogoImg) {
            currentLogoImg.src = currentSeller.storeLogo;
        }
    }
    
    // Load bank accounts
    displayBankAccounts(currentSeller.bankAccounts || []);
    
    // Setup logo form listeners
    const logoUpdateForm = document.getElementById('logo-update-form');
    if (logoUpdateForm && !logoUpdateForm.dataset.listenerAdded) {
        logoUpdateForm.addEventListener('submit', handleLogoUpdate);
        logoUpdateForm.dataset.listenerAdded = 'true';
    }
    
    const logoInput = document.getElementById('new-store-logo');
    if (logoInput && !logoInput.dataset.listenerAdded) {
        logoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const currentLogoImg = document.getElementById('current-store-logo');
                    if (currentLogoImg) {
                        currentLogoImg.src = e.target.result;
                    }
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
        logoInput.dataset.listenerAdded = 'true';
    }
}


// Handle Logo Update
async function handleLogoUpdate(event) {
    event.preventDefault();
    
    const form = event.target;
    const fileInput = document.getElementById('new-store-logo');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a logo file');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload JPG or PNG');
        return;
    }
    
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('File is too large. Maximum size is 2MB');
        return;
    }
    
    try {
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.show('Uploading logo...');
        }
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        
        const formData = new FormData();
        formData.append('storeLogo', file);
        
        const response = await fetch(`${API_URL}/sellers/${user.id}/logo`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            user.storeLogo = result.storeLogo;
            localStorage.setItem('user', JSON.stringify(user));
            currentSeller.storeLogo = result.storeLogo;
            
            document.getElementById('current-store-logo').src = result.storeLogo;
            document.getElementById('store-logo').src = result.storeLogo;
            document.getElementById('seller-avatar').src = result.storeLogo;
            
            if (typeof loadingIndicator !== 'undefined') {
                loadingIndicator.hide();
            }
            
            alert('Logo updated successfully!');
            form.reset();
            
        } else {
            throw new Error(result.message || 'Failed to update logo');
        }
        
    } catch (error) {
        console.error('Logo update error:', error);
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        alert('Failed to update logo: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-upload"></i> Update Logo';
    }
}

// Handle Store Info Update
document.getElementById('store-info-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.show('Updating store settings...');
        }
        
        const formData = new FormData(e.target);
        const updateData = {
            storeName: formData.get('storeName'),
            storeDescription: formData.get('storeDescription'),
            phoneNumber: formData.get('phoneNumber')
        };
        
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(`${API_URL}/sellers/${user.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        
        if (result.success) {
            alert('Store settings updated successfully!');
            loadSellerData(); // Reload seller data
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating store settings:', error);
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        alert('Failed to update settings');
    }
});

// Show/Hide Bank Account Form
function showAddBankAccountForm() {
    document.getElementById('add-bank-account-form').style.display = 'block';
}

function hideAddBankAccountForm() {
    document.getElementById('add-bank-account-form').style.display = 'none';
    document.getElementById('bank-account-form').reset();
}

window.showAddBankAccountForm = showAddBankAccountForm;
window.hideAddBankAccountForm = hideAddBankAccountForm;

// Handle Add Bank Account
document.getElementById('bank-account-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.show('Adding bank account...');
        }
        
        const formData = new FormData(e.target);
        const bankData = {
            currency: formData.get('currency'),
            bankName: formData.get('bankName'),
            accountName: formData.get('accountName'),
            accountNumber: formData.get('accountNumber'),
            swiftCode: formData.get('swiftCode')
        };
        
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(`${API_URL}/sellers/${user.id}/bank-account`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bankData)
        });
        
        const result = await response.json();
        
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        
        if (result.success) {
            alert('Bank account added successfully!');
            hideAddBankAccountForm();
            loadSellerData(); // Reload to show new account
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding bank account:', error);
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        alert('Failed to add bank account');
    }
});

// Remove Bank Account
async function removeBankAccount(accountId) {
    if (!confirm('Remove this bank account?')) return;
    
    try {
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.show('Removing account...');
        }
        
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(`${API_URL}/sellers/${user.id}/bank-account/${accountId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
        
        if (result.success) {
            alert('Bank account removed!');
            loadSellerData();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error removing account:', error);
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
    }
}

window.removeBankAccount = removeBankAccount;

// Update loadSectionData function
const originalLoadSectionData = loadSectionData;
loadSectionData = async function(sectionId) {
    await originalLoadSectionData(sectionId);
    
    if (sectionId === 'store-settings') {
        loadStoreSettings();
    }
};

// Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login.html';
    }
}