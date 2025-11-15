// admin-dashboard.js - COMPLETE REWRITE

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initNavigation();
    initCharts();
});

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
            }
            
            // Close sidebar on mobile
            document.querySelector('.admin-sidebar')?.classList.remove('open');
            
            // Handle logout
            if (targetId === 'admin-logout') {
                if (confirm('Logout?')) {
                    localStorage.clear();
                    window.location.href = '/login.html';
                }
            }
        });
    });
    
    // Activate first item
    navItems[0]?.click();
}

// Initialize Charts
function initCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [6500, 5900, 8000, 8100, 5600, 5500, 7000],
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
    if (userCtx) {
        new Chart(userCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'New Users',
                    data: [120, 190, 80, 150, 200, 180, 160],
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