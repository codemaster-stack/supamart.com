// admin-dashboard-script.js

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentSections = document.querySelectorAll('.dashboard-section');

    // --- Toggle Sidebar on Mobile ---
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            document.body.classList.toggle('sidebar-open');
        });
    }

    // --- Handle Navigation and Content Switching ---
    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            if (event.target.closest('.nav-item')) {
                event.preventDefault();

                const targetId = item.querySelector('a').getAttribute('href').substring(1);

                navItems.forEach(ni => ni.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));

                item.classList.add('active');

                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    const headerTitleElement = document.querySelector('.admin-header h2'); // Target admin header
                    if (headerTitleElement) {
                        const sectionTitle = targetSection.querySelector('h3');
                        if (sectionTitle) {
                             headerTitleElement.textContent = sectionTitle.textContent;
                        } else {
                            headerTitleElement.textContent = 'Admin Dashboard';
                        }
                    }
                }

                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    document.body.classList.remove('sidebar-open');
                }

                if (targetId === 'admin-logout') {
                    console.log("Logging out admin...");
                    // window.location.href = '/admin/logout'; // Example logout URL
                }
            }
        });
    });

    // --- Initialize Default Section ---
    const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
    if (activeNavItem) {
        activeNavItem.click();
    } else {
        const firstNavItem = document.querySelector('.sidebar-nav .nav-item:not(.logout)');
        if (firstNavItem) {
            firstNavItem.click();
        }
    }

    // --- Initialize Charts ---
    // Example for Revenue Chart
    const revenueChartCanvas = document.getElementById('revenueChart');
    if (revenueChartCanvas && typeof Chart !== 'undefined') {
        const ctx = revenueChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Revenue',
                    data: [6500, 5900, 8000, 8100, 5600, 5500, 4000],
                    backgroundColor: 'rgba(0, 123, 255, 0.2)', // Primary blue
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 2,
                    tension: 0.1
                }]
            },
            options: { scales: { y: { beginAtZero: true } }, responsive: true, maintainAspectRatio: false }
        });
    }

    // Example for User Growth Chart
    const userGrowthChartCanvas = document.getElementById('userGrowthChart');
    if (userGrowthChartCanvas && typeof Chart !== 'undefined') {
        const ctx = userGrowthChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'New Users',
                    data: [120, 190, 80, 150, 200, 180, 160],
                    backgroundColor: 'rgba(40, 167, 69, 0.6)', // Success green
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                }]
            },
            options: { scales: { y: { beginAtZero: true } }, responsive: true, maintainAspectRatio: false }
        });
    }

    // --- Placeholder for Table Data Loading ---
    // In a real application, you'd use AJAX to load data into tables and charts
    // For example, when clicking on "Manage Products", fetch product data and populate the table.
});