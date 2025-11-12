// global.js - Global initialization for all pages

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize currency conversion
    await initializeCurrencyConversion();
    
    // Show currency indicator
    displayCurrencyIndicator();
});

// Initialize currency conversion for logged-in users
async function initializeCurrencyConversion() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Only convert prices for regular users (not sellers/admins)
    if (token && role === 'user') {
        // Check if currencyConverter is available
        if (typeof currencyConverter !== 'undefined') {
            try {
                await currencyConverter.convertAllPrices();
                console.log('✅ Prices converted to user currency');
            } catch (error) {
                console.error('❌ Currency conversion failed:', error);
            }
        }
    }
}

// Display currency indicator on pages
function displayCurrencyIndicator() {
    const userCurrency = localStorage.getItem('userCurrency');
    const role = localStorage.getItem('role');
    
    // Only show for logged-in users
    if (userCurrency && role === 'user') {
        const indicator = document.getElementById('currency-indicator');
        if (indicator) {
            indicator.style.display = 'block';
            const currencyText = indicator.querySelector('#user-currency');
            if (currencyText) {
                currencyText.textContent = userCurrency;
            }
        }
    }
}

// Helper: Check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Helper: Get user role
function getUserRole() {
    return localStorage.getItem('role') || null;
}

// Helper: Get user currency
function getUserCurrency() {
    return localStorage.getItem('userCurrency') || 'USD';
}

// Helper: Logout function
function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
}