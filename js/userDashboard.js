// dashboard-script.js

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentSections = document.querySelectorAll('.dashboard-section');
    const sellerOnlyElements = document.querySelectorAll('.seller-only');

    // --- Category Select Logic ---
    const categorySelect = document.querySelector('.category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;
            if (selectedCategory) {
                console.log('Navigating to category:', selectedCategory);
                // In a real app, you would navigate to a category page
                // window.location.href = `/categories/${selectedCategory}`;
                // For now, just reset it or show an alert:
                alert(`Navigating to ${selectedCategory} category... (Not fully implemented)`);
                this.value = ''; // Reset the dropdown to the default placeholder
            }
        });
    }

    // --- Search Functionality ---
    const searchInput = document.querySelector('.header-search input[type="text"]');
    const searchIcon = document.querySelector('.header-search .fa-search');
    if (searchInput && searchIcon) {
        // Handle search submission when icon is clicked or Enter is pressed
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                console.log('Searching for:', query);
                // In a real app, you would navigate to a search results page
                // window.location.href = `/search?q=${encodeURIComponent(query)}`;
                alert(`Searching for "${query}"... (Not fully implemented)`);
            }
        };

        searchIcon.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }


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
            // Check if the click was on a nav item, not just a general link within a section
            if (event.target.closest('.nav-item')) {
                event.preventDefault();

                const targetId = item.querySelector('a').getAttribute('href').substring(1);

                navItems.forEach(ni => ni.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));

                item.classList.add('active');

                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    const headerTitleElement = document.querySelector('.dashboard-header h2');
                    if (headerTitleElement) {
                        const sectionTitle = targetSection.querySelector('h3');
                        if (sectionTitle) {
                             headerTitleElement.textContent = sectionTitle.textContent;
                        } else {
                            headerTitleElement.textContent = 'Dashboard';
                        }
                    }
                }

                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    document.body.classList.remove('sidebar-open');
                }

                if (targetId === 'logout') {
                    console.log("Logging out...");
                    // window.location.href = '/logout';
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

    // --- Handle Seller-Only Visibility ---
    const isUserSeller = document.body.hasAttribute('data-is-seller');

    if (isUserSeller) {
        sellerOnlyElements.forEach(el => {
            el.style.display = el.tagName === 'LI' ? 'list-item' : 'block';
        });
    } else {
        sellerOnlyElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    // --- Chart.js Example ---
    if (typeof Chart !== 'undefined') {
        const salesChartCanvas = document.getElementById('salesChart');
        if (salesChartCanvas) {
            const ctx = salesChartCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                    datasets: [{
                        label: 'Sales',
                        data: [12, 19, 3, 5, 2, 3, 8],
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        borderColor: 'rgba(0, 123, 255, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    }]
                },
                options: {
                    scales: { y: { beginAtZero: true } },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }
});


