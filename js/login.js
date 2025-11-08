// login-script.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            clearErrorMessages(); // Clear previous errors
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

            // If any validation fails, prevent form submission
            if (!isValid) {
                event.preventDefault();
            } else {
                // If valid, submit to backend
                console.log('Form is valid, submitting to backend...');
                // Your backend will handle authentication and redirection
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

    // Append error message below the input
    formGroup.appendChild(errorMessage);

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