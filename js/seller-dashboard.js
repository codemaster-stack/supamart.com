// seller-dashboard-script.js

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
            // Ensure the click is on a nav item itself, not a nested element that might have its own handler
            if (event.target.closest('.nav-item')) {
                event.preventDefault();

                const targetId = item.querySelector('a').getAttribute('href').substring(1);

                // Deactivate all nav items and hide all content sections
                navItems.forEach(ni => ni.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));

                // Activate the clicked nav item
                item.classList.add('active');

                // Show the target content section
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    // Update header title
                    const headerTitleElement = document.querySelector('.seller-header h2'); // Target seller header
                    if (headerTitleElement) {
                        const sectionTitle = targetSection.querySelector('h3');
                        if (sectionTitle) {
                             headerTitleElement.textContent = sectionTitle.textContent;
                        } else {
                            headerTitleElement.textContent = 'Seller Dashboard'; // Default title
                        }
                    }
                }

                // Close sidebar on mobile after navigation
                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    document.body.classList.remove('sidebar-open');
                }

                // Handle logout
                if (targetId === 'logout') {
                    console.log("Logging out seller...");
                    // window.location.href = '/seller/logout'; // Example logout URL
                }
            }
        });
    });

    // --- Initialize Default Section ---
    const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
    if (activeNavItem) {
        activeNavItem.click();
    } else {
        // If no active item, load the first one by default (overview)
        const firstNavItem = document.querySelector('.sidebar-nav .nav-item:not(.logout)');
        if (firstNavItem) {
            firstNavItem.click();
        }
    }

    // --- Chart Example (if using Chart.js) ---
    if (typeof Chart !== 'undefined') {
        const salesOverviewChartCanvas = document.getElementById('salesOverviewChart');
        if (salesOverviewChartCanvas) {
            const ctx = salesOverviewChartCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'bar', // Example: use bar chart for sales overview
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Sales',
                        data: [65, 59, 80, 81, 56, 55, 40],
                        backgroundColor: 'rgba(40, 167, 69, 0.6)', // Seller accent green
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }
});