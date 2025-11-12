// adminSignup.js - Admin Registration with Backend API Integration

document.addEventListener('DOMContentLoaded', () => {
    const adminSignupForm = document.getElementById('adminSignupForm');
    const adminEmailInput = document.getElementById('adminEmail');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminConfirmPasswordInput = document.getElementById('adminConfirmPassword');
    const adminFullNameInput = document.getElementById('adminFullName');

    if (adminSignupForm) {
        adminSignupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            clearErrorMessages();
            let isValid = true;

            const email = adminEmailInput.value.trim();
            const password = adminPasswordInput.value;
            const confirmPassword = adminConfirmPasswordInput.value;
            const fullName = adminFullNameInput.value.trim();

            // Email Validation
            if (email === '') {
                showError(adminEmailInput, 'Email address is required.');
                isValid = false;
            } else if (!validateEmailFormat(email)) {
                showError(adminEmailInput, 'Please enter a valid email address.');
                isValid = false;
            }

            // Password Validation
            if (password.length < 8) {
                showError(adminPasswordInput, 'Password must be at least 8 characters long.');
                isValid = false;
            }
            
            // Password complexity check
            if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || 
                !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
                showError(adminPasswordInput, 'Password must contain uppercase, lowercase, number, and special character.');
                isValid = false;
            }

            // Confirm Password Validation
            if (confirmPassword === '') {
                showError(adminConfirmPasswordInput, 'Please confirm your password.');
                isValid = false;
            } else if (password !== confirmPassword) {
                showError(adminConfirmPasswordInput, 'Passwords do not match.');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            // Submit to backend
            await handleAdminSignup({
                email,
                password,
                confirmPassword,
                fullName
            });
        });
    }
});

// Backend API Admin Signup Handler
async function handleAdminSignup(adminData) {
    const submitBtn = document.querySelector('#adminSignupForm button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    try {
        // Show loading indicator
        loadingIndicator.show('Creating admin account...');
        loadingIndicator.setButtonLoading(submitBtn, true, 'Creating Account...');
        
        // Call backend API - REPLACE WITH YOUR RENDER URL
        const response = await fetch('https://api-supamart.onrender.com/api/auth/register/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adminData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Store authentication data
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.admin));
            localStorage.setItem('role', result.admin.role);
            
            // Update loading message
            loadingIndicator.show('Admin account created successfully!');
            showSuccessMessage('Admin account created successfully! Redirecting to dashboard...');
            
            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = '/admin-dashboard';
            }, 2000);
            
        } else {
            loadingIndicator.hide();
            showGlobalError(result.message || 'Admin registration failed. Please try again.');
        }
        
    } catch (error) {
        console.error('Admin signup error:', error);
        loadingIndicator.hide();
        showGlobalError('Network error. Please check your connection and try again.');
    } finally {
        loadingIndicator.setButtonLoading(submitBtn, false, originalBtnText);
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

    if (formGroup.querySelector('.password-hint')) {
        formGroup.querySelector('.password-hint').insertAdjacentElement('afterend', errorMessage);
    } else {
        formGroup.appendChild(errorMessage);
    }

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
    const adminBox = document.querySelector('.admin-signup-box');
    if (!adminBox) return;
    
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
        animation: slideDown 0.3s ease;
    `;
    messageDiv.textContent = message;
    
    const form = document.getElementById('adminSignupForm');
    adminBox.insertBefore(messageDiv, form);
}

function showGlobalError(message) {
    const adminBox = document.querySelector('.admin-signup-box');
    if (!adminBox) return;
    
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
        animation: slideDown 0.3s ease;
    `;
    messageDiv.textContent = message;
    
    const form = document.getElementById('adminSignupForm');
    adminBox.insertBefore(messageDiv, form);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}