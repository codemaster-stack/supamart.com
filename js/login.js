// login.js - Updated with Loading Indicator and Currency Detection

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            clearErrorMessages();
            let isValid = true;

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Validate Email
            if (email === '') {
                showError(emailInput, 'Email address is required.');
                isValid = false;
            } else if (!validateEmailFormat(email)) {
                showError(emailInput, 'Please enter a valid email address.');
                isValid = false;
            }

            // Validate Password
            if (password === '') {
                showError(passwordInput, 'Password is required.');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            await handleLogin(email, password, rememberMeCheckbox.checked);
        });
    }
});

async function handleLogin(email, password, rememberMe) {
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    
    try {
        // Show loading indicator
        loadingIndicator.show('Logging in...');
        loadingIndicator.setButtonLoading(submitBtn, true, 'Logging in...');
        
        const loginData = {
            email: email,
            password: password
        };
        
        // Call backend API
        const response = await fetch('https://api-supamart.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('token', result.token);
            storage.setItem('user', JSON.stringify(result.user));
            storage.setItem('role', result.role);
            
            // NEW: Store user's currency and location (for regular users only)
            if (result.user.role === 'user' && result.user.currency) {
                storage.setItem('userCurrency', result.user.currency);
                console.log('✅ User currency set to:', result.user.currency);
            }
            if (result.user.role === 'user' && result.user.location) {
                storage.setItem('userLocation', JSON.stringify(result.user.location));
                console.log('✅ User location:', result.user.location);
            }
            
            // Update loading message
            loadingIndicator.show('Login successful! Redirecting...');
            showSuccessMessage('Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = result.dashboardUrl;
            }, 1500);
            
        } else {
            loadingIndicator.hide();
            showGlobalError(result.message || 'Login failed. Please try again.');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        loadingIndicator.hide();
        showGlobalError('Network error. Please check your connection and try again.');
    } finally {
        loadingIndicator.setButtonLoading(submitBtn, false, 'Login');
    }
}

function validateEmailFormat(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function showError(element, message) {
    const formGroup = element.closest('.form-group');
    if (!formGroup) return;

    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorMessage = document.createElement('small');
    errorMessage.className = 'error-message';
    errorMessage.style.cssText = `
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 5px;
        display: block;
    `;
    errorMessage.textContent = message;

    formGroup.appendChild(errorMessage);
    element.classList.add('input-error');
}

function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());

    const inputErrors = document.querySelectorAll('.input-error');
    inputErrors.forEach(input => input.classList.remove('input-error'));
    
    const globalMessages = document.querySelectorAll('.global-message');
    globalMessages.forEach(msg => msg.remove());
}

function showSuccessMessage(message) {
    const loginBox = document.querySelector('.login-box');
    if (!loginBox) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'global-message success-message';
    messageDiv.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 20px;
        border-radius: 6px;
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        font-size: 14px;
        font-weight: 500;
    `;
    messageDiv.textContent = message;
    
    const form = document.getElementById('loginForm');
    loginBox.insertBefore(messageDiv, form);
}

function showGlobalError(message) {
    const loginBox = document.querySelector('.login-box');
    if (!loginBox) return;
    
    const existingMessages = document.querySelectorAll('.global-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'global-message error-message-global';
    messageDiv.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 20px;
        border-radius: 6px;
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        font-size: 14px;
        font-weight: 500;
    `;
    messageDiv.textContent = message;
    
    const form = document.getElementById('loginForm');
    loginBox.insertBefore(messageDiv, form);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

document.querySelectorAll('.btn-social').forEach(button => {
    button.addEventListener('click', (event) => {
        alert('Social login is not implemented yet. This is a placeholder.');
        event.preventDefault();
    });
});