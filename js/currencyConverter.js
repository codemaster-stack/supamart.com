// currencyConverter.js - Client-side price conversion

class CurrencyConverter {
    constructor() {
        this.userCurrency = localStorage.getItem('userCurrency') || 'USD';
        this.apiUrl = 'https://your-render-url.onrender.com/api/products/convert-price';
    }

    async convertPrice(price, fromCurrency) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    price: price,
                    fromCurrency: fromCurrency,
                    toCurrency: this.userCurrency
                })
            });

            const result = await response.json();
            
            if (result.success) {
                return result.formattedPrice;
            }
            
            return `${fromCurrency} ${price}`;
        } catch (error) {
            console.error('Currency conversion error:', error);
            return `${fromCurrency} ${price}`;
        }
    }

    // Convert all prices on page
    async convertAllPrices() {
        const priceElements = document.querySelectorAll('[data-price]');
        
        for (const element of priceElements) {
            const originalPrice = parseFloat(element.dataset.price);
            const originalCurrency = element.dataset.currency || 'USD';
            
            const convertedPrice = await this.convertPrice(originalPrice, originalCurrency);
            element.textContent = convertedPrice;
        }
    }

    getUserCurrency() {
        return this.userCurrency;
    }
}

// Create global instance
const currencyConverter = new CurrencyConverter();