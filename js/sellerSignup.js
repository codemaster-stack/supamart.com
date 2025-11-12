// sellerSignup.js - Updated with Backend API Integration and Loading Indicator

document.addEventListener('DOMContentLoaded', () => {
    const sellerSignupForm = document.getElementById('sellerSignupForm');
    const sellerEmailInput = document.getElementById('sellerEmail');
    const sellerPasswordInput = document.getElementById('sellerPassword');
    const sellerFullNameInput = document.getElementById('sellerFullName');
    const storeNameInput = document.getElementById('storeName');
    const storeURLInput = document.getElementById('storeURL');
    const storeDescriptionTextarea = document.getElementById('storeDescription');
    const sellerCountrySelect = document.getElementById('sellerCountry');
    const sellerPhoneNumberInput = document.getElementById('sellerPhoneNumber');
    const sellerTermsCheckbox = document.getElementById('sellerTerms');

    // New elements for logo and address
    const storeLogoInput = document.getElementById('storeLogo');
    const storeLogoWrapper = document.querySelector('.file-upload-wrapper');
    const fileNameDisplay = document.querySelector('.file-name-display');

    const addressLine1Input = document.getElementById('addressLine1');
    const addressLine2Input = document.getElementById('addressLine2');
    const cityInput = document.getElementById('city');
    const stateProvinceInput = document.getElementById('stateProvince');
    const postalCodeInput = document.getElementById('postalCode');

    let itiSeller = null;

    // --- Initialize Intl Tel Input for Seller Phone ---
    if (sellerPhoneNumberInput && sellerCountrySelect) {
        itiSeller = window.intlTelInput(sellerPhoneNumberInput, {
            autoPlaceholder: "polite",
            preferredCountries: ["ng", "us", "gb", "ca"],
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
        });

        sellerCountrySelect.addEventListener('change', function() {
            const selectedCountryCode = this.value;
            if (selectedCountryCode) {
                itiSeller.setCountry(selectedCountryCode.toLowerCase());
            }
        });

        sellerPhoneNumberInput.addEventListener('countrychange', function() {
            const selectedCountryIso2 = itiSeller.getSelectedCountryData().iso2;
            if (selectedCountryIso2) {
                sellerCountrySelect.value = selectedCountryIso2.toUpperCase();
            }
        });

        const countryData = window.intlTelInputGlobals.getCountryData();
        countryData.forEach(country => {
            const option = document.createElement('option');
            option.value = country.iso2.toUpperCase();
            option.textContent = `${country.name} (+${country.dialCode})`;
            sellerCountrySelect.appendChild(option);
        });
        
        const initialCountryIso2 = itiSeller.getSelectedCountryData().iso2;
        if (initialCountryIso2) {
            sellerCountrySelect.value = initialCountryIso2.toUpperCase();
        }
    }

    // --- Handle Store Logo Upload Display with Preview ---
    if (storeLogoInput && fileNameDisplay && storeLogoWrapper) {
        storeLogoInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                const fileName = file.name;
                fileNameDisplay.textContent = fileName;
                storeLogoWrapper.classList.add('has-file');
                
                // Optional: Show image preview
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // You can add image preview here if needed
                        console.log('Image loaded for preview');
                    };
                    reader.readAsDataURL(file);
                }
            } else {
                fileNameDisplay.textContent = 'No file chosen';
                storeLogoWrapper.classList.remove('has-file');
            }
        });
    }

    // --- Form Validation and Submission ---
    if (sellerSignupForm) {
        sellerSignupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            clearErrorMessages();
            let isValid = true;

            // Account Information
            const sellerEmail = sellerEmailInput.value.trim();
            const sellerPassword = sellerPasswordInput.value;

            // Store Details
            const storeName = storeNameInput.value.trim();
            const storeURL = storeURLInput.value.trim();
            const storeDescription = storeDescriptionTextarea.value.trim();
            const storeLogo = storeLogoInput.files;

            // Contact Information
            const sellerFullName = sellerFullNameInput.value.trim();
            const sellerCountry = sellerCountrySelect.value;

            // Address Information
            const addressLine1 = addressLine1Input.value.trim();
            const addressLine2 = addressLine2Input.value.trim();
            const city = cityInput.value.trim();
            const stateProvince = stateProvinceInput.value.trim();
            const postalCode = postalCodeInput.value.trim();

            // Validate Account Information
            if (sellerEmail === '') {
                showError(sellerEmailInput, 'Business email is required.');
                isValid = false;
            } else if (!validateEmailFormat(sellerEmail)) {
                showError(sellerEmailInput, 'Please enter a valid email address.');
                isValid = false;
            }

            if (sellerPassword.length < 8) {
                showError(sellerPasswordInput, 'Password must be at least 8 characters long.');
                isValid = false;
            }

            // Validate Store Details
            if (storeName === '') {
                showError(storeNameInput, 'Store name is required.');
                isValid = false;
            }

            if (storeURL !== '' && !/^[a-zA-Z0-9-]+$/.test(storeURL)) {
                showError(storeURLInput, 'Store URL can only contain letters, numbers, and hyphens.');
                isValid = false;
            }

            if (storeDescription === '') {
                showError(storeDescriptionTextarea, 'Store description is required.');
                isValid = false;
            }

            // Validate Store Logo Upload
            if (!storeLogo || storeLogo.length === 0) {
                showError(storeLogoInput, 'Please upload your store logo.');
                isValid = false;
            } else {
                const file = storeLogo[0];
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                const maxSize = 2 * 1024 * 1024; // 2MB

                if (!allowedTypes.includes(file.type)) {
                    showError(storeLogoInput, 'Invalid file type. Please upload JPG or PNG.');
                    isValid = false;
                } else if (file.size > maxSize) {
                    showError(storeLogoInput, 'Logo file is too large. Maximum size is 2MB.');
                    isValid = false;
                }
            }

            // Validate Contact Information
            if (sellerFullName === '') {
                showError(sellerFullNameInput, 'Contact person\'s full name is required.');
                isValid = false;
            }

            if (sellerCountry === '') {
                showError(sellerCountrySelect, 'Please select your country.');
                isValid = false;
            }

            if (itiSeller && !itiSeller.isValidNumber()) {
                showError(sellerPhoneNumberInput, 'Please enter a valid phone number.');
                isValid = false;
            }

            // Validate Address Information
            if (addressLine1 === '') {
                showError(addressLine1Input, 'Address Line 1 is required.');
                isValid = false;
            }
            if (city === '') {
                showError(cityInput, 'City is required.');
                isValid = false;
            }
            if (stateProvince === '') {
                showError(stateProvinceInput, 'State/Province is required.');
                isValid = false;
            }
            if (postalCode === '') {
                showError(postalCodeInput, 'Postal code is required.');
                isValid = false;
            }

            // Validate Terms Agreement
            if (!sellerTermsCheckbox.checked) {
                showError(sellerTermsCheckbox, 'You must agree to the seller terms.');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            // Format phone number
            const formattedPhoneNumber = itiSeller ? itiSeller.getNumber() : sellerPhoneNumberInput.value;
            
            // Get country name
            const countryName = sellerCountrySelect.options[sellerCountrySelect.selectedIndex].text.split('(')[0].trim();

            // Submit to backend
            await handleSellerSignup({
                email: sellerEmail,
                password: sellerPassword,
                storeName: storeName,
                storeURL: storeURL,
                storeDescription: storeDescription,
                storeLogo: storeLogo[0],
                fullName: sellerFullName,
                country: countryName,
                phoneNumber: formattedPhoneNumber,
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                city: city,
                stateProvince: stateProvince,
                postalCode: postalCode
            });
        });
    }
});

// Backend API Seller Signup Handler
async function handleSellerSignup(sellerData) {
    const submitBtn = document.querySelector('#sellerSignupForm button[type="submit"]');
    
    try {
        // Show loading indicator
        loadingIndicator.show('Registering your store...');
        loadingIndicator.setButtonLoading(submitBtn, true, 'Registering Store...');
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('email', sellerData.email);
        formData.append('password', sellerData.password);
        formData.append('storeName', sellerData.storeName);
        formData.append('storeURL', sellerData.storeURL);
        formData.append('storeDescription', sellerData.storeDescription);
        formData.append('storeLogo', sellerData.storeLogo); // File object
        formData.append('fullName', sellerData.fullName);
        formData.append('country', sellerData.country);
        formData.append('phoneNumber', sellerData.phoneNumber);
        formData.append('addressLine1', sellerData.addressLine1);
        formData.append('addressLine2', sellerData.addressLine2);
        formData.append('city', sellerData.city);
        formData.append('stateProvince', sellerData.stateProvince);
        formData.append('postalCode', sellerData.postalCode);
        
        // Call backend API - REPLACE WITH YOUR RENDER URL
        const response = await fetch('https://api-supamart.onrender.com/api/auth/register/seller', {
            method: 'POST',
            body: formData // Don't set Content-Type header, browser will set it with boundary
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Store authentication data
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.seller));
            localStorage.setItem('role', result.seller.role);
            
            // Update loading message
            loadingIndicator.show('Store registered successfully!');
            showSuccessMessage('Store registered successfully! Your account is pending approval. Redirecting...');
            
            // Redirect to seller dashboard
            setTimeout(() => {
                window.location.href = '/merchant';
            }, 2500);
            
        } else {
            loadingIndicator.hide();
            showGlobalError(result.message || 'Registration failed. Please try again.');
        }
        
    } catch (error) {
        console.error('Seller signup error:', error);
        loadingIndicator.hide();
        showGlobalError('Network error. Please check your connection and try again.');
    } finally {
        loadingIndicator.setButtonLoading(submitBtn, false, 'Register Your Store');
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
    } else if (element.type === 'checkbox') {
        const label = formGroup.querySelector('label');
        if (label) {
            label.insertAdjacentElement('afterend', errorMessage);
        } else {
            formGroup.appendChild(errorMessage);
        }
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
    const sellerBox = document.querySelector('.seller-signup-box');
    if (!sellerBox) return;
    
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
    
    const form = document.getElementById('sellerSignupForm');
    sellerBox.insertBefore(messageDiv, form);
}

function showGlobalError(message) {
    const sellerBox = document.querySelector('.seller-signup-box');
    if (!sellerBox) return;
    
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
    
    const form = document.getElementById('sellerSignupForm');
    sellerBox.insertBefore(messageDiv, form);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}