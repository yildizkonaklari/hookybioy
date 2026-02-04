// ========================================
// HOOKY BIO - BILLING MANAGER
// Digital Goods API for Google Play
// ========================================

const PRODUCT_IDS = {
    monthly: 'hookybio_pro_monthly',
    yearly: 'hookybio_pro_yearly'
};

class BillingManager {
    constructor() {
        this.service = null;
        this.products = new Map();
        this.isAvailable = false;
    }

    // Initialize Digital Goods API
    async initialize() {
        if (!('getDigitalGoodsService' in window)) {
            console.log('Digital Goods API not available');
            return false;
        }

        try {
            this.service = await window.getDigitalGoodsService('https://play.google.com/billing');
            this.isAvailable = true;
            console.log('Digital Goods API initialized');

            // Load products
            await this.loadProducts();

            // Check existing entitlements
            await this.checkEntitlements();

            return true;
        } catch (error) {
            console.error('Failed to initialize Digital Goods API:', error);
            return false;
        }
    }

    // Load available products from Play Store
    async loadProducts() {
        if (!this.service) return;

        try {
            const productIds = Object.values(PRODUCT_IDS);
            const details = await this.service.getDetails(productIds);

            details.forEach(product => {
                this.products.set(product.itemId, {
                    id: product.itemId,
                    title: product.title,
                    description: product.description,
                    price: product.price.value,
                    currency: product.price.currency,
                    formattedPrice: this.formatPrice(product.price)
                });
            });

            console.log('Products loaded:', this.products);

            // Update UI with real prices
            this.updatePriceUI();
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    }

    // Format price for display
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: price.currency
        }).format(price.value);
    }

    // Update UI with real prices from Play Store
    updatePriceUI() {
        const monthlyProduct = this.products.get(PRODUCT_IDS.monthly);
        const yearlyProduct = this.products.get(PRODUCT_IDS.yearly);

        // Update paywall prices if elements exist
        const monthlyPriceEl = document.getElementById('monthlyPrice');
        const yearlyPriceEl = document.getElementById('yearlyPrice');

        if (monthlyPriceEl && monthlyProduct) {
            monthlyPriceEl.textContent = monthlyProduct.formattedPrice + '/mo';
        }
        if (yearlyPriceEl && yearlyProduct) {
            yearlyPriceEl.textContent = yearlyProduct.formattedPrice + '/yr';
        }
    }

    // Check if user has active subscription
    async checkEntitlements() {
        if (!this.service) return false;

        try {
            const entitlements = await this.service.listPurchases();

            for (const entitlement of entitlements) {
                if (Object.values(PRODUCT_IDS).includes(entitlement.itemId)) {
                    // User has active PRO subscription
                    this.grantProAccess();
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Failed to check entitlements:', error);
            return false;
        }
    }

    // Purchase a subscription
    async purchase(productId) {
        if (!this.service) {
            console.error('Billing service not available');
            return { success: false, error: 'Billing not available' };
        }

        try {
            // Create PaymentRequest
            const paymentMethods = [{
                supportedMethods: 'https://play.google.com/billing',
                data: {
                    sku: productId
                }
            }];

            const paymentDetails = {
                total: {
                    label: 'Hooky Bio PRO',
                    amount: { currency: 'USD', value: '0' }
                }
            };

            const request = new PaymentRequest(paymentMethods, paymentDetails);
            const response = await request.show();

            // Complete the payment
            await response.complete('success');

            // For subscriptions, we need to acknowledge (NOT consume)
            // The purchase token is used for acknowledgment
            try {
                const tokenData = JSON.parse(response.details.token);
                if (tokenData.purchaseToken) {
                    // Acknowledge the subscription purchase
                    await this.service.acknowledge(tokenData.purchaseToken, 'onetime');
                    console.log('Purchase acknowledged successfully');
                }
            } catch (ackError) {
                // Acknowledgment might fail but purchase is still valid
                console.warn('Acknowledgment warning:', ackError);
            }

            // Grant PRO access immediately after successful purchase
            this.grantProAccess();

            return { success: true };
        } catch (error) {
            console.error('Purchase failed:', error);

            if (error.name === 'AbortError') {
                return { success: false, error: 'Purchase cancelled' };
            }

            return { success: false, error: error.message };
        }
    }

    // Grant PRO access to the user
    grantProAccess() {
        // Set PRO status in localStorage
        localStorage.setItem('hooky_bio_pro', 'true');

        // Set global flag
        window.isProUser = true;

        // Update PRO badge
        const proBadge = document.getElementById('proBadge');
        if (proBadge) {
            proBadge.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
            proBadge.textContent = '✓ PRO';
        }

        // Remove PRO tags from all chips
        document.querySelectorAll('.pro-tag').forEach(tag => tag.remove());

        // Enable all PRO features
        document.querySelectorAll('.chip.pro-feature').forEach(chip => {
            chip.classList.remove('pro-feature');
            chip.removeAttribute('data-pro');
        });

        // Hide paywall if open
        const paywallOverlay = document.getElementById('paywallOverlay');
        if (paywallOverlay) {
            paywallOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }

        // Hide upgrade hint
        const upgradeHint = document.getElementById('upgradeHint');
        if (upgradeHint) {
            upgradeHint.classList.add('hidden');
        }

        // Hide soft reminder
        const softReminder = document.getElementById('softReminder');
        if (softReminder) {
            softReminder.classList.add('hidden');
        }

        // Show success message
        if (typeof showToast === 'function') {
            showToast('Welcome to PRO! 🎉');
        }

        console.log('PRO access granted successfully!');
    }

    // Restore purchases (for users who reinstall)
    async restorePurchases() {
        const hasEntitlement = await this.checkEntitlements();

        if (hasEntitlement) {
            showToast('PRO access restored!');
            return true;
        } else {
            showToast('No previous purchases found');
            return false;
        }
    }
}

// Create global instance
const billingManager = new BillingManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    billingManager.initialize();
});

// Export for use in app.js
window.billingManager = billingManager;
window.PRODUCT_IDS = PRODUCT_IDS;
