// ========================================
// HOOKY BIO - APP.JS
// AI-Powered Bio Generation with Freemium
// ========================================

// Config - API endpoint (works with both Vercel and Netlify)
const API_ENDPOINT = '/api/generate';
const FREE_DAILY_LIMIT = 3;
const STORAGE_KEYS = {
    usage: 'hooky_bio_usage',
    isPro: 'hooky_bio_pro',
    firstBioDate: 'hooky_bio_first'
};

// PRO-only features
const PRO_FEATURES = {
    output: ['Hook', 'CTA', 'Variations', 'All'],
    style: ['Expressive']
};

// DOM Elements
const nicheInput = document.getElementById('nicheInput');
const audienceInput = document.getElementById('audienceInput');
const generateBtn = document.getElementById('generateBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const copyAllBtn = document.getElementById('copyAllBtn');
const proBadge = document.getElementById('proBadge');
const upgradeHint = document.getElementById('upgradeHint');
const softReminder = document.getElementById('softReminder');
const reminderLink = document.getElementById('reminderLink');
const paywallOverlay = document.getElementById('paywallOverlay');
const paywallClose = document.getElementById('paywallClose');
const paywallTitle = document.getElementById('paywallTitle');
const paywallSubtitle = document.getElementById('paywallSubtitle');
const paywallNote = document.getElementById('paywallNote');
const paywallCta = document.getElementById('paywallCta');

// Exit early if not on main page
if (!generateBtn) {
    console.log('Hooky Bio: Elements not found');
} else {

    // ========================================
    // STATE MANAGEMENT
    // ========================================
    let currentState = {
        platform: 'Instagram',
        niche: '',
        audience: '',
        goal: 'Followers',
        style: 'Balanced',
        output: 'Bio'
    };

    // ========================================
    // USAGE & PRO STATUS
    // ========================================
    function getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    function getUsageData() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.usage) || '{}');
            const today = getTodayKey();
            if (data.date !== today) {
                return { date: today, count: 0, totalBios: data.totalBios || 0 };
            }
            return data;
        } catch {
            return { date: getTodayKey(), count: 0, totalBios: 0 };
        }
    }

    function incrementUsage() {
        const data = getUsageData();
        data.count++;
        data.totalBios = (data.totalBios || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.usage, JSON.stringify(data));
        return data;
    }

    function getRemainingFreeUses() {
        const data = getUsageData();
        return Math.max(0, FREE_DAILY_LIMIT - data.count);
    }

    function isPro() {
        return localStorage.getItem(STORAGE_KEYS.isPro) === 'true';
    }

    function isFirstBio() {
        return !localStorage.getItem(STORAGE_KEYS.firstBioDate);
    }

    function markFirstBioComplete() {
        localStorage.setItem(STORAGE_KEYS.firstBioDate, getTodayKey());
    }

    // ========================================
    // PAYWALL LOGIC
    // ========================================
    function showPaywall(type = 'default') {
        const messages = {
            'pro-feature': {
                title: 'This feature is PRO only',
                subtitle: 'Unlock hook lines, CTAs, and bio variations.',
                note: 'Cancel anytime'
            },
            'limit-reached': {
                title: "You've reached today's limit",
                subtitle: 'Go PRO for unlimited bio creation.',
                note: 'Or try again tomorrow'
            },
            'default': {
                title: 'Unlock PRO Bios',
                subtitle: 'Turn profile visitors into followers.',
                note: 'Cancel anytime'
            }
        };

        const msg = messages[type] || messages.default;
        paywallTitle.textContent = msg.title;
        paywallSubtitle.textContent = msg.subtitle;
        paywallNote.textContent = msg.note;

        paywallOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function hidePaywall() {
        paywallOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function isProFeature(group, value) {
        return PRO_FEATURES[group]?.includes(value);
    }

    // ========================================
    // CHIP GROUP HANDLING
    // ========================================
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const group = chip.dataset.group;
            const value = chip.dataset.value;
            const isProOnly = chip.dataset.pro === 'true';

            // Check if PRO feature and user is not PRO
            if (isProOnly && !isPro()) {
                showPaywall('pro-feature');
                return;
            }

            // Remove active from siblings
            document.querySelectorAll(`.chip[data-group="${group}"]`).forEach(c => {
                c.classList.remove('active');
            });

            // Add active to clicked
            chip.classList.add('active');

            // Update state
            currentState[group] = value;
        });
    });

    // ========================================
    // API CALL
    // ========================================
    async function generateWithAPI(platform, niche, audience, goal, style, outputType) {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                platform,
                niche,
                audience,
                goal,
                style,
                outputType
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate');
        }

        const data = await response.json();
        return data;
    }

    // ========================================
    // PARSE API RESPONSE
    // ========================================
    function parseResponse(content, outputType) {
        const results = {};

        if (outputType === 'Hook') {
            results.hook = content.trim();
        } else if (outputType === 'CTA') {
            results.cta = content.trim();
        } else if (outputType === 'Bio') {
            results.bio = content.trim();
        } else if (outputType === 'Variations') {
            const parts = content.split(/\n\n+/).filter(p => p.trim());
            results.variations = parts.slice(0, 3);
        } else if (outputType === 'All') {
            const parts = content.split(/\n\n+/).filter(p => p.trim());

            if (parts.length >= 1) results.hook = parts[0];
            if (parts.length >= 2) results.bio = parts[1];
            if (parts.length >= 3) results.cta = parts[2];
            if (parts.length >= 4) {
                results.variations = parts.slice(3, 6);
            }
        }

        return results;
    }

    // ========================================
    // UI RENDERING
    // ========================================
    function renderResults(results) {
        resultsContainer.innerHTML = '';

        if (results.hook) {
            resultsContainer.appendChild(createResultCard('Hook', results.hook));
        }

        if (results.bio) {
            resultsContainer.appendChild(createResultCard('Bio', results.bio));
        }

        if (results.cta) {
            resultsContainer.appendChild(createResultCard('CTA', results.cta));
        }

        if (results.variations && results.variations.length > 0) {
            const variationsWrapper = document.createElement('div');
            variationsWrapper.className = 'variations-wrapper';

            results.variations.forEach((variation, index) => {
                variationsWrapper.appendChild(createVariationCard(index + 1, variation));
            });

            resultsContainer.appendChild(variationsWrapper);
        }

        resultsSection.classList.remove('hidden');

        // Show soft reminder for free users after generation
        if (!isPro()) {
            softReminder.classList.remove('hidden');
        }
    }

    function createResultCard(label, content) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
        <div class="result-label">${label}</div>
        <div class="result-content">${escapeHtml(content)}</div>
        <div class="result-actions">
            <button class="copy-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
            </button>
        </div>
    `;

        const copyBtn = card.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => copyToClipboard(content, copyBtn));

        return card;
    }

    function createVariationCard(number, content) {
        const card = document.createElement('div');
        card.className = 'variation-card';
        card.innerHTML = `
        <div class="variation-header">
            <span class="variation-number">Variation ${number}</span>
            <button class="variation-copy-btn">Copy</button>
        </div>
        <div class="variation-content">${escapeHtml(content)}</div>
    `;

        const copyBtn = card.querySelector('.variation-copy-btn');
        copyBtn.addEventListener('click', () => copyToClipboard(content, copyBtn));

        return card;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // CLIPBOARD & TOAST
    // ========================================
    async function copyToClipboard(text, button) {
        try {
            await navigator.clipboard.writeText(text);

            const originalText = button.innerHTML;
            button.classList.add('copied');
            button.innerHTML = button.classList.contains('variation-copy-btn') ? 'Copied!' : `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;

            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalText;
            }, 2000);

            showToast('Copied to clipboard');
        } catch (err) {
            showToast('Failed to copy', true);
        }
    }

    function copyAllResults() {
        const allContent = Array.from(resultsContainer.querySelectorAll('.result-content, .variation-content'))
            .map(el => el.textContent)
            .join('\n\n---\n\n');

        copyToClipboard(allContent, copyAllBtn);
    }

    function showToast(message, isError = false) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // ========================================
    // VALIDATION
    // ========================================
    function validateInputs() {
        currentState.niche = nicheInput.value.trim();
        currentState.audience = audienceInput.value.trim();

        if (!currentState.niche) {
            showToast('Please describe what you do', true);
            nicheInput.focus();
            return false;
        }

        if (!currentState.audience) {
            showToast('Please describe who it\'s for', true);
            audienceInput.focus();
            return false;
        }

        return true;
    }

    // ========================================
    // GENERATE HANDLER
    // ========================================
    async function handleGenerate() {
        if (!validateInputs()) return;

        // Check daily limit for free users
        if (!isPro() && getRemainingFreeUses() <= 0) {
            showPaywall('limit-reached');
            return;
        }

        const btnText = generateBtn.querySelector('.btn-text');
        const btnLoader = generateBtn.querySelector('.btn-loader');
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        generateBtn.disabled = true;

        try {
            const { platform, niche, audience, goal, style, output } = currentState;

            const data = await generateWithAPI(platform, niche, audience, goal, style, output);
            const results = parseResponse(data.content, output);

            // Increment usage for free users
            if (!isPro()) {
                incrementUsage();
            }

            // Mark first bio complete and show upgrade hint
            if (isFirstBio()) {
                markFirstBioComplete();
                upgradeHint.classList.remove('hidden');
            }

            renderResults(results);

            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (error) {
            console.error('Generation error:', error);
            showToast(error.message || 'Failed to generate. Please try again.', true);
        } finally {
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            generateBtn.disabled = false;
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    generateBtn.addEventListener('click', handleGenerate);
    copyAllBtn.addEventListener('click', copyAllResults);

    [nicheInput, audienceInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleGenerate();
            }
        });
    });

    // PRO badge click - open paywall
    proBadge.addEventListener('click', () => {
        if (!isPro()) {
            showPaywall('default');
        }
    });

    // Reminder link click
    reminderLink.addEventListener('click', () => {
        showPaywall('default');
    });

    // Paywall close
    paywallClose.addEventListener('click', hidePaywall);
    paywallOverlay.addEventListener('click', (e) => {
        if (e.target === paywallOverlay) {
            hidePaywall();
        }
    });

    // Plan selection
    let selectedPlan = 'monthly';
    const planMonthly = document.getElementById('planMonthly');
    const planYearly = document.getElementById('planYearly');

    if (planMonthly && planYearly) {
        planMonthly.addEventListener('click', () => {
            planMonthly.classList.add('active');
            planYearly.classList.remove('active');
            selectedPlan = 'monthly';
        });

        planYearly.addEventListener('click', () => {
            planYearly.classList.add('active');
            planMonthly.classList.remove('active');
            selectedPlan = 'yearly';
        });
    }

    // Paywall CTA - Purchase subscription
    paywallCta.addEventListener('click', async () => {
        if (!window.billingManager || !window.billingManager.isAvailable) {
            // Fallback for testing or unsupported environments
            showToast('Purchase not available in this environment');
            return;
        }

        const productId = window.PRODUCT_IDS[selectedPlan];
        paywallCta.disabled = true;
        paywallCta.textContent = 'Processing...';

        try {
            const result = await window.billingManager.purchase(productId);

            if (result.success) {
                hidePaywall();
                showToast('Welcome to PRO! 🎉');
            } else {
                showToast(result.error || 'Purchase failed', true);
            }
        } catch (error) {
            showToast('Purchase failed. Please try again.', true);
        } finally {
            paywallCta.disabled = false;
            paywallCta.textContent = 'Upgrade to PRO';
        }
    });

    // Restore purchases
    const restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', async () => {
            if (!window.billingManager) {
                showToast('Restore not available');
                return;
            }

            restoreBtn.textContent = 'Restoring...';
            const restored = await window.billingManager.restorePurchases();

            if (restored) {
                hidePaywall();
            }
            restoreBtn.textContent = 'Restore Purchase';
        });
    }

    // Escape key to close paywall
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hidePaywall();
        }
    });

    // Prevent zoom on double tap for iOS
    document.addEventListener('dblclick', (e) => {
        e.preventDefault();
    }, { passive: false });

    // ========================================
    // INIT
    // ========================================
    function init() {
        // Update PRO badge if user is PRO
        if (isPro()) {
            proBadge.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
            proBadge.textContent = '✓ PRO';

            // Remove PRO tags from chips
            document.querySelectorAll('.pro-tag').forEach(tag => tag.remove());
            document.querySelectorAll('.chip.pro-feature').forEach(chip => {
                chip.classList.remove('pro-feature');
                chip.removeAttribute('data-pro');
            });
        }
    }

    init();

} // End of main page block
