document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.querySelector("#phone");
  const iti = window.intlTelInput(phoneInput, {
    initialCountry: "auto",
    separateDialCode: true, // ✅ shows dropdown for country code
    nationalMode: false,     // ✅ allows full international number
    geoIpLookup: callback => callback('us'), // fallback country
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
  });

  document.getElementById('signup-form').addEventListener('submit', e => {
    e.preventDefault();
    const fullPhone = iti.getNumber(); // +2348012345678
    console.log('Full phone number:', fullPhone);
  });
});
