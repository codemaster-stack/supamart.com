document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle-btn');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentSections = document.querySelectorAll('.dashboard-section');

    // Toggle Sidebar
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            document.body.classList.toggle('sidebar-open');
        });
    }

    // Navigation
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
                    const headerTitleElement = document.querySelector('.seller-header h2');
                    if (headerTitleElement) {
                        const sectionTitle = targetSection.querySelector('h3');
                        headerTitleElement.textContent = sectionTitle ? sectionTitle.textContent : 'Seller Dashboard';
                    }
                }

                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    document.body.classList.remove('sidebar-open');
                }

                if (targetId === 'logout') {
                    console.log("Logging out seller...");
                    // window.location.href = '/seller/logout';
                }
            }
        });
    });


    // WIDGET LINKS NAVIGATION (NEW!!)
// ===============================
// ===============================
// WIDGET LINKS NAVIGATION (NEW!!)
// ===============================
const widgetLinks = document.querySelectorAll('.widget-link');
const headerTitleElement = document.querySelector('.seller-header h2'); // <-- keep only this one

widgetLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        e.preventDefault();
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        // Hide all sections
        contentSections.forEach(sec => sec.classList.remove('active'));

        // Activate target section
        targetSection.classList.add('active');

        // Update header title
        const sectionTitle = targetSection.querySelector('h3');
        if (headerTitleElement) {
            headerTitleElement.textContent = sectionTitle ? sectionTitle.textContent : 'Seller Dashboard';
        }

        // Highlight sidebar item that matches the widget link
        navItems.forEach(item => item.classList.remove('active'));
        const matchingSidebar = document.querySelector(`.sidebar-nav a[href="${href}"]`);
        if (matchingSidebar) {
            matchingSidebar.parentElement.classList.add('active');
        }

        // Close sidebar on mobile
        sidebar?.classList.remove('open');
        document.body.classList.remove('sidebar-open');
    });
});


    // Initialize default section
    const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
    if (activeNavItem) activeNavItem.click();
    else {
        const firstNavItem = document.querySelector('.sidebar-nav .nav-item:not(.logout)');
        if (firstNavItem) firstNavItem.click();
    }

    // --- Sales Chart ---
    const salesOverviewChartCanvas = document.getElementById('salesOverviewChart');
    if (salesOverviewChartCanvas) {
        fetch('/api/seller/sales')  // replace with your actual endpoint
            .then(res => res.json())
            .then(data => {
                const ctx = salesOverviewChartCanvas.getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'Sales',
                            data: data.values,
                            backgroundColor: 'rgba(40, 167, 69, 0.6)',
                            borderColor: 'rgba(40, 167, 69, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: { 
                        scales: { y: { beginAtZero: true } }, 
                        responsive: true, 
                        maintainAspectRatio: false 
                    }
                });
            })
            .catch(err => console.error('Error loading sales chart:', err));
    }

    // --- Orders Table ---
    const ordersTbody = document.querySelector('#seller-orders tbody');
    if (ordersTbody) {
        fetch('/api/seller/orders') // replace with your actual endpoint
            .then(res => res.json())
            .then(orders => {
                ordersTbody.innerHTML = '';
                orders.forEach(order => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${order.id}</td>
                        <td>${order.productName}</td>
                        <td>${order.customerName}</td>
                        <td>${new Date(order.date).toLocaleDateString()}</td>
                        <td>$${order.total.toFixed(2)}</td>
                        <td>${order.status}</td>
                        <td><a href="#">View</a></td>
                    `;
                    ordersTbody.appendChild(tr);
                });
            })
            .catch(err => console.error('Error loading orders table:', err));
    }

});
