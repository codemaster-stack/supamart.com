// seller-signup-script.js

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

    let itiSeller = null; // For seller phone input

    // --- Initialize Intl Tel Input for Seller Phone ---
    if (sellerPhoneNumberInput && sellerCountrySelect) {
        itiSeller = window.intlTelInput(sellerPhoneNumberInput, {
            autoPlaceholder: "polite",
            preferredCountries: ["us", "gb", "in", "ca"],
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
            option.textContent = `${country.name} (${country.dialCode})`;
            sellerCountrySelect.appendChild(option);
        });
        const initialCountryIso2 = itiSeller.getSelectedCountryData().iso2;
        if (initialCountryIso2) {
            sellerCountrySelect.value = initialCountryIso2.toUpperCase();
        }
    }

    // --- Handle Store Logo Upload Display ---
    if (storeLogoInput && fileNameDisplay && storeLogoWrapper) {
        storeLogoInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const fileName = this.files[0].name;
                fileNameDisplay.textContent = fileName;
                storeLogoWrapper.classList.add('has-file'); // Add class for styling
            } else {
                fileNameDisplay.textContent = 'No file chosen';
                storeLogoWrapper.classList.remove('has-file');
            }
        });
    }

    // --- Form Validation ---
    if (sellerSignupForm) {
        sellerSignupForm.addEventListener('submit', (event) => {
            clearErrorMessages();
            let isValid = true;

            // Account Information
            const sellerEmail = sellerEmailInput.value.trim();
            const sellerPassword = sellerPasswordInput.value;

            // Store Details
            const storeName = storeNameInput.value.trim();
            const storeURL = storeURLInput.value.trim();
            const storeDescription = storeDescriptionTextarea.value.trim();
            const storeLogo = storeLogoInput.files; // This will be a FileList object

            // Contact Information
            const sellerFullName = sellerFullNameInput.value.trim();
            const sellerCountry = sellerCountrySelect.value;

            // Address Information
            const addressLine1 = addressLine1Input.value.trim();
            const addressLine2 = addressLine2Input.value.trim(); // Optional
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
                const allowedTypes = ['image/jpeg', 'image/png'];
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
                event.preventDefault();
            } else {
                // Format phone number for submission
                if (itiSeller) {
                    const formattedPhoneNumber = itiSeller.getNumber();
                    console.log('Formatted Seller Phone Number:', formattedPhoneNumber);
                }
                console.log('Seller form is valid, submitting to backend...');
                // The form will submit to '/seller/register' via POST method
            }
        });
    }
});

// --- Helper Functions (re-use from previous JS files if in a shared script) ---

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
}