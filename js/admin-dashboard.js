// admin-dashboard.js - Connected to Backend

const API_URL = 'https://api-supamart.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is logged in
    checkAuth();
    
    initSidebar();
    initNavigation();
    loadDashboardData();
});

// Check Authentication
// Check Authentication - IMPROVED
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    console.log('=== AUTH CHECK ===');
    console.log('Token:', token ? 'EXISTS' : 'MISSING');
    console.log('Role:', role);
    console.log('==================');
    
    if (!token) {
        console.error('❌ No token found');
        alert('Session expired. Please login again.');
        window.location.href = '/login.html';
        return false;
    }
    
    if (role !== 'admin') {
        console.error('❌ Not an admin. Role:', role);
        alert('Unauthorized! Admin access only.');
        // Don't redirect immediately - let user see the alert
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return false;
    }
    
    console.log('✅ Auth check passed');
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
    const sidebar = document.querySelector('.admin-sidebar');
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
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = item.querySelector('a').getAttribute('href').substring(1);
            
            // Remove active
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active
            item.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Update header
                const title = targetSection.querySelector('h3');
                if (title) {
                    document.querySelector('.admin-header h2').textContent = title.textContent;
                }
                
                // Load section data
                loadSectionData(targetId);
            }
            
            // Close sidebar on mobile
            document.querySelector('.admin-sidebar')?.classList.remove('open');
            
            // Handle logout
            if (targetId === 'admin-logout') {
                handleLogout();
            }
        });
    });
    
    // Activate first item
    navItems[0]?.click();
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.show('Loading dashboard...');
        }
        
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateDashboardStats(data.stats);
            updateCharts(data.charts);
        }
        
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        if (typeof loadingIndicator !== 'undefined') {
            loadingIndicator.hide();
        }
    }
}

// Update Dashboard Stats
function updateDashboardStats(stats) {
    // Update widgets
    const widgets = document.querySelectorAll('.admin-widget');
    
    if (widgets[0]) {
        widgets[0].querySelector('.widget-value').textContent = 
            '$' + (stats.totalRevenue || 0).toLocaleString();
    }
    
    if (widgets[1]) {
        widgets[1].querySelector('.widget-value').textContent = 
            (stats.totalUsers || 0).toLocaleString();
    }
    
    if (widgets[2]) {
        widgets[2].querySelector('.widget-value').textContent = 
            (stats.totalSellers || 0).toLocaleString();
    }
    
    if (widgets[3]) {
        widgets[3].querySelector('.widget-value').textContent = 
            (stats.totalOrders || 0).toLocaleString();
    }
}

// Update Charts
function updateCharts(charts) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx && charts.monthlyRevenue) {
        const labels = charts.monthlyRevenue.map(item => monthNames[item._id - 1]);
        const data = charts.monthlyRevenue.map(item => item.total);
        
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue ($)',
                    data: data,
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderColor: '#007bff',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
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
                            callback: v => '$' + v.toLocaleString()
                        }
                    }
                }
            }
        });
    }
    
    // User Growth Chart
    const userCtx = document.getElementById('userGrowthChart');
    if (userCtx && charts.monthlyUsers) {
        const labels = charts.monthlyUsers.map(item => monthNames[item._id - 1]);
        const data = charts.monthlyUsers.map(item => item.count);
        
        new Chart(userCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'New Users',
                    data: data,
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
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
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// Load Section Data
async function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'manage-users':
            await loadUsers();
            break;
        case 'manage-sellers':
            await loadSellers();
            break;
        case 'manage-products':
            await loadProducts();
            break;
        case 'manage-orders':
            await loadOrders();
            break;
    }
}

// Load Users
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayUsersTable(data.users);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Display Users Table
function displayUsersTable(users) {
    const tbody = document.querySelector('#manage-users tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = `
            <tr>
                <td>${user._id.substring(0, 8)}...</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td><span class="badge badge-primary">${user.role}</span></td>
                <td><span class="badge ${user.isActive ? 'badge-success' : 'badge-danger'}">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn-sm btn-danger" onclick="suspendUser('${user._id}')">
                        <i class="fas fa-ban"></i> Suspend
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Load Sellers
async function loadSellers() {
    try {
        const response = await fetch(`${API_URL}/admin/sellers`, {
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (data.success) {
            displaySellersTable(data.sellers);
        }
    } catch (error) {
        console.error('Error loading sellers:', error);
    }
}

// Display Sellers Table
function displaySellersTable(sellers) {
    const tbody = document.querySelector('#manage-sellers tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    sellers.forEach(seller => {
        const row = `
            <tr>
                <td>${seller._id.substring(0, 8)}...</td>
                <td>${seller.storeName}</td>
                <td>${seller.fullName}</td>
                <td>${seller.email}</td>
                <td><span class="badge ${seller.isApproved ? 'badge-success' : 'badge-warning'}">
                    ${seller.isApproved ? 'Approved' : 'Pending'}
                </span></td>
                <td>${new Date(seller.createdAt).toLocaleDateString()}</td>
                <td>
                    ${!seller.isApproved ? `
                        <button class="btn-sm btn-success" onclick="approveSeller('${seller._id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                    ` : ''}
                    <button class="btn-sm btn-danger" onclick="suspendSeller('${seller._id}')">
                        <i class="fas fa-ban"></i> Suspend
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Approve Seller
async function approveSeller(sellerId) {
    if (!confirm('Approve this seller?')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/sellers/${sellerId}/approve`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Seller approved successfully!');
            loadSellers();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error approving seller:', error);
        alert('Failed to approve seller');
    }
}

// Suspend Seller
async function suspendSeller(sellerId) {
    if (!confirm('Suspend this seller?')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/sellers/${sellerId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Seller suspended successfully!');
            loadSellers();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error suspending seller:', error);
        alert('Failed to suspend seller');
    }
}

// Load Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/admin/products`, {
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayProductsTable(data.products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display Products Table
function displayProductsTable(products) {
    const tbody = document.querySelector('#manage-products tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = `
            <tr>
                <td>${product._id.substring(0, 8)}...</td>
                <td>${product.name}</td>
                <td>${product.sellerId?.storeName || 'N/A'}</td>
                <td>${product.price.currency} ${product.price.amount}</td>
                <td>${product.stock}</td>
                <td><span class="badge ${product.isActive ? 'badge-success' : 'badge-danger'}">
                    ${product.isActive ? 'Active' : 'Inactive'}
                </span></td>
                <td>
                    <button class="btn-sm btn-danger" onclick="deleteProduct('${product._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('Delete this product?')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Product deleted successfully!');
            loadProducts();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
    }
}

// Load Orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayOrdersTable(data.orders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display Orders Table
function displayOrdersTable(orders) {
    const tbody = document.querySelector('#manage-orders tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>${order.buyer.name || 'N/A'}</td>
                <td>Multiple</td>
                <td>${order.payment.currency} ${order.payment.amount}</td>
                <td><span class="badge badge-info">${order.status}</span></td>
                <td>
                    <button class="btn-sm btn-primary" onclick="viewOrder('${order._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// View Order
function viewOrder(orderId) {
    alert('Order details functionality coming soon!');
    // window.location.href = `/admin/order-details.html?id=${orderId}`;
}

// Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login.html';
    }
}