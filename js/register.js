// signup-script.js

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    const countrySelect = document.getElementById('country');
    const phoneNumberInput = document.getElementById('phoneNumber');

    // --- Phone Number and Country Code Input Initialization ---
    let iti = null; // To hold the intl-tel-input instance

    if (phoneNumberInput && countrySelect) {
        iti = window.intlTelInput(phoneNumberInput, {
            autoPlaceholder: "polite", // 'polite', 'aggressive'
            preferredCountries: ["us", "gb", "in", "ca"], // List your preferred countries at the top
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js", // Required for formatting and validation
            // You can add more options here: https://intl-tel-input.com/node_modules/intl-tel-input/docs/index.html#options
        });

        // Sync country selection with the phone input's country
        countrySelect.addEventListener('change', function() {
            const selectedCountryCode = this.value; // e.g., "US"
            if (selectedCountryCode) {
                iti.setCountry(selectedCountryCode.toLowerCase()); // Library expects lowercase country code
            }
        });

        // Update country select when the phone input's country changes
        phoneNumberInput.addEventListener('countrychange', function() {
            const selectedCountryIso2 = iti.getSelectedCountryData().iso2; // e.g., "us"
            if (selectedCountryIso2) {
                countrySelect.value = selectedCountryIso2.toUpperCase(); // Update the HTML select element
            }
        });

        // Auto-populate the country select dropdown with all countries
        const countryData = window.intlTelInputGlobals.getCountryData();
        countryData.forEach(country => {
            const option = document.createElement('option');
            option.value = country.iso2.toUpperCase(); // e.g., "US"
            option.textContent = `${country.name} (${country.dialCode})`; // e.g., "United States (+1)"
            countrySelect.appendChild(option);
        });
        // Set default selected country if it's already set by the plugin
        const initialCountryIso2 = iti.getSelectedCountryData().iso2;
        if (initialCountryIso2) {
            countrySelect.value = initialCountryIso2.toUpperCase();
        }
    }


    // --- Form Validation ---
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            clearErrorMessages(); // Clear previous errors first
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

            // Validate Phone Number (using the library's utility)
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

            // If any validation fails, prevent form submission
            if (!isValid) {
                event.preventDefault();
            } else {
                // IMPORTANT: Format the phone number for submission
                // This will send the international format (e.g., +11234567890)
                if (iti) {
                    const fullPhoneNumber = iti.getNumber();
                    // You might want to store this in a hidden input if your backend expects it that way
                    // Or simply use iti.getNumber() directly in your backend validation/processing.
                    console.log('Formatted Phone Number:', fullPhoneNumber);
                    // Example: If you have a hidden input for the formatted number
                    // document.getElementById('formattedPhoneNumber').value = fullPhoneNumber;
                }
                console.log('Form is valid, submitting to backend...');
            }
        });
    }
});

function validateEmailFormat(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function showError(element, message) {
    const formGroup = element.closest('.form-group');
    if (!formGroup) return;

    // Remove any existing error message for this element
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create new error message element
    const errorMessage = document.createElement('small');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;

    // Append error message below the input or hint
    if (formGroup.querySelector('.password-hint')) {
        formGroup.querySelector('.password-hint').insertAdjacentElement('afterend', errorMessage);
    } else {
        // For checkboxes, append after the label
        const label = formGroup.querySelector('label');
        if (label) {
            label.insertAdjacentElement('afterend', errorMessage);
        } else {
            formGroup.appendChild(errorMessage);
        }
    }

    // Add error class to input for potential styling
    element.classList.add('input-error');
}

function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());

    const inputErrors = document.querySelectorAll('.input-error');
    inputErrors.forEach(input => input.classList.remove('input-error'));
}

// Optional: Add validation for social login buttons if needed
document.querySelectorAll('.btn-social').forEach(button => {
    button.addEventListener('click', (event) => {
        alert('Social login is not implemented yet. This is a placeholder.');
        event.preventDefault();
    });
});