// register.js - Updated with Backend API Integration and Loading Indicator

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    const countrySelect = document.getElementById('country');
    const phoneNumberInput = document.getElementById('phoneNumber');

    // --- Phone Number and Country Code Input Initialization ---
    let iti = null;

    if (phoneNumberInput && countrySelect) {
        iti = window.intlTelInput(phoneNumberInput, {
            autoPlaceholder: "polite",
            preferredCountries: ["ng", "us", "gb", "ca"],
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
        });

        // Sync country selection with the phone input's country
        countrySelect.addEventListener('change', function() {
            const selectedCountryCode = this.value;
            if (selectedCountryCode) {
                iti.setCountry(selectedCountryCode.toLowerCase());
            }
        });

        // Update country select when the phone input's country changes
        phoneNumberInput.addEventListener('countrychange', function() {
            const selectedCountryIso2 = iti.getSelectedCountryData().iso2;
            if (selectedCountryIso2) {
                countrySelect.value = selectedCountryIso2.toUpperCase();
            }
        });

        // Auto-populate the country select dropdown with all countries
        const countryData = window.intlTelInputGlobals.getCountryData();
        countryData.forEach(country => {
            const option = document.createElement('option');
            option.value = country.iso2.toUpperCase();
            option.textContent = `${country.name} (+${country.dialCode})`;
            countrySelect.appendChild(option);
        });
        
        // Set default selected country
        const initialCountryIso2 = iti.getSelectedCountryData().iso2;
        if (initialCountryIso2) {
            countrySelect.value = initialCountryIso2.toUpperCase();
        }
    }

    // --- Form Validation and Submission ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            clearErrorMessages();
            let isValid = true;

            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const country = countrySelect.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Validate Full Name
            if (fullName === '') {
                showError(document.getElementById('fullName'), 'Full name is required.');
                isValid = false;
            }

            // Validate Email
            if (email === '') {
                showError(document.getElementById('email'), 'Email address is required.');
                isValid = false;
            } else if (!validateEmailFormat(email)) {
                showError(document.getElementById('email'), 'Please enter a valid email address.');
                isValid = false;
            }

            // Validate Country
            if (country === '') {
                showError(countrySelect, 'Please select your country.');
                isValid = false;
            }

            // Validate Phone Number
            if (iti && !iti.isValidNumber()) {
                showError(phoneNumberInput, 'Please enter a valid phone number.');
                isValid = false;
            }

            // Validate Password
            if (password.length < 8) {
                showError(passwordInput, 'Password must be at least 8 characters long.');
                isValid = false;
            }

            // Validate Confirm Password
            if (confirmPassword !== password) {
                showError(confirmPasswordInput, 'Passwords do not match.');
                isValid = false;
            }

            // Validate Terms and Conditions
            if (!termsCheckbox.checked) {
                showError(termsCheckbox, 'You must agree to the terms.');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            // Get formatted phone number
            const fullPhoneNumber = iti ? iti.getNumber() : phoneNumberInput.value;
            
            // Get country name from select
            const countryName = countrySelect.options[countrySelect.selectedIndex].text.split('(')[0].trim();

            // Submit to backend
            await handleSignup({
                fullName,
                email,
                password,
                country: countryName,
                phoneNumber: fullPhoneNumber
            });
        });
    }
});

// Backend API Signup Handler
async function handleSignup(signupData) {
    const submitBtn = document.querySelector('#signupForm button[type="submit"]');
    
    try {
        // Show loading indicator
        loadingIndicator.show('Creating your account...');
        loadingIndicator.setButtonLoading(submitBtn, true, 'Creating Account...');
        
        // Call backend API - REPLACE WITH YOUR RENDER URL
        const response = await fetch('https://api-supamart.onrender.com/api/auth/register/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Store authentication data
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('role', result.user.role);
            
            // Update loading message
            loadingIndicator.show('Account created successfully! Redirecting...');
            showSuccessMessage('Account created successfully! Redirecting to your dashboard...');
            
            // Redirect to user dashboard
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            
        } else {
            loadingIndicator.hide();
            showGlobalError(result.message || 'Registration failed. Please try again.');
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        loadingIndicator.hide();
        showGlobalError('Network error. Please check your connection and try again.');
    } finally {
        loadingIndicator.setButtonLoading(submitBtn, false, 'Sign Up');
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
        const label = formGroup.querySelector('label');
        if (label) {
            label.insertAdjacentElement('afterend', errorMessage);
        } else {
            formGroup.appendChild(errorMessage);
        }
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
    const signupBox = document.querySelector('.signup-box');
    if (!signupBox) return;
    
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
    
    const form = document.getElementById('signupForm');
    signupBox.insertBefore(messageDiv, form);
}

function showGlobalError(message) {
    const signupBox = document.querySelector('.signup-box');
    if (!signupBox) return;
    
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
    
    const form = document.getElementById('signupForm');
    signupBox.insertBefore(messageDiv, form);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Social login buttons
document.querySelectorAll('.btn-social').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        alert('Social login is not implemented yet. This is a placeholder.');
    });
});