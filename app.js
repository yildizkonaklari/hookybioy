// ========================================
// HOOKY BIO GENERATOR - APP.JS
// ========================================

// DOM Elements
const platformGroup = document.getElementById('platformGroup');
const goalGroup = document.getElementById('goalGroup');
const styleGroup = document.getElementById('styleGroup');
const outputGroup = document.getElementById('outputGroup');
const nicheInput = document.getElementById('nicheInput');
const audienceInput = document.getElementById('audienceInput');
const generateBtn = document.getElementById('generateBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const copyAllBtn = document.getElementById('copyAllBtn');

// State
let currentState = {
    platform: 'Instagram',
    niche: '',
    audience: '',
    goal: 'Followers',
    style: 'Balanced',
    output: 'Bio'
};

// ========================================
// CHIP GROUP HANDLING
// ========================================
function setupChipGroup(group, stateKey) {
    const chips = group.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentState[stateKey] = chip.dataset.value;
        });
    });
}

setupChipGroup(platformGroup, 'platform');
setupChipGroup(goalGroup, 'goal');
setupChipGroup(styleGroup, 'style');
setupChipGroup(outputGroup, 'output');

// ========================================
// BIO GENERATION LOGIC
// ========================================

// Platform-specific templates and rules
const platformRules = {
    Instagram: { maxLength: 150, tone: 'casual', lineBreaks: true },
    TikTok: { maxLength: 80, tone: 'casual', lineBreaks: true },
    YouTube: { maxLength: 1000, tone: 'professional', lineBreaks: true },
    X: { maxLength: 160, tone: 'sharp', lineBreaks: false },
    LinkedIn: { maxLength: 300, tone: 'professional', lineBreaks: true }
};

// Hook line generators by niche pattern
function generateHookLine(niche, audience, goal, platform) {
    const nicheLC = niche.toLowerCase();
    const audienceLC = audience.toLowerCase();
    
    // Fitness
    if (nicheLC.includes('fitness') || nicheLC.includes('gym') || nicheLC.includes('workout')) {
        const hooks = [
            `Helping ${audience} build strength that lasts`,
            `${audience} deserve real fitness results`,
            `Training ${audience} to move better, feel better`
        ];
        return hooks[Math.floor(Math.random() * hooks.length)];
    }
    
    // Tech
    if (nicheLC.includes('tech') || nicheLC.includes('software') || nicheLC.includes('coding')) {
        const hooks = [
            `Making ${nicheLC} simple for ${audience}`,
            `${audience} building better tech`,
            `Turning complex ${nicheLC} into clear wins`
        ];
        return hooks[Math.floor(Math.random() * hooks.length)];
    }
    
    // Business/Marketing
    if (nicheLC.includes('business') || nicheLC.includes('marketing') || nicheLC.includes('sales')) {
        const hooks = [
            `Helping ${audience} grow with clarity`,
            `${audience} deserve better ${nicheLC} results`,
            `Building businesses that actually work`
        ];
        return hooks[Math.floor(Math.random() * hooks.length)];
    }
    
    // Fashion/Beauty
    if (nicheLC.includes('fashion') || nicheLC.includes('beauty') || nicheLC.includes('style')) {
        const hooks = [
            `${audience} finding their signature look`,
            `Style that fits ${audience}`,
            `Making ${nicheLC} accessible and real`
        ];
        return hooks[Math.floor(Math.random() * hooks.length)];
    }
    
    // Content/Creator
    if (nicheLC.includes('content') || nicheLC.includes('creator') || nicheLC.includes('influence')) {
        const hooks = [
            `Helping ${audience} create content that connects`,
            `${audience} building real audiences`,
            `Content strategy for ${audience}`
        ];
        return hooks[Math.floor(Math.random() * hooks.length)];
    }
    
    // Default generic hooks
    const genericHooks = [
        `Helping ${audience} with ${niche}`,
        `${niche} for ${audience}`,
        `${audience} deserve better ${niche}`
    ];
    return genericHooks[Math.floor(Math.random() * genericHooks.length)];
}

function generateValueLine(niche, audience, goal, platform) {
    const goalLines = {
        Followers: [
            `Sharing what actually works`,
            `Real insights, no fluff`,
            `Follow for practical tips`
        ],
        DMs: [
            `Let's talk strategy`,
            `Open to connect`,
            `Building something? Let's chat`
        ],
        Sales: [
            `Products that deliver`,
            `Solutions that work`,
            `Results you can measure`
        ],
        Authority: [
            `Years of experience, condensed`,
            `Trusted by industry leaders`,
            `Proven track record`
        ]
    };
    
    const lines = goalLines[goal] || goalLines.Followers;
    return lines[Math.floor(Math.random() * lines.length)];
}

function generateCTALine(goal, style) {
    const ctaLines = {
        Followers: {
            Minimal: [`Follow for more`],
            Balanced: [`New here? Follow along`],
            Expressive: [`Join the community ✨`]
        },
        DMs: {
            Minimal: [`DM to connect`],
            Balanced: [`DM 'START' to begin`],
            Expressive: [`Slide into the DMs 📩`]
        },
        Sales: {
            Minimal: [`Link below`],
            Balanced: [`Shop link in bio`],
            Expressive: [`Grab yours below 👇`]
        },
        Authority: {
            Minimal: [`Speaking & consulting`],
            Balanced: [`Keynote speaker & consultant`],
            Expressive: [`Book me for your next event 🎤`]
        }
    };
    
    const goalCTAs = ctaLines[goal] || ctaLines.Followers;
    const styleCTAs = goalCTAs[style] || goalCTAs.Balanced;
    return styleCTAs[Math.floor(Math.random() * styleCTAs.length)];
}

function generateFullBio(platform, niche, audience, goal, style) {
    const rules = platformRules[platform];
    const hookLine = generateHookLine(niche, audience, goal, platform);
    const valueLine = generateValueLine(niche, audience, goal, platform);
    const ctaLine = generateCTALine(goal, style);
    
    if (rules.lineBreaks) {
        return `${hookLine}\n${valueLine}\n${ctaLine}`;
    } else {
        return `${hookLine}. ${valueLine}. ${ctaLine}`;
    }
}

function generateVariations(platform, niche, audience, goal, style) {
    const variations = [];
    const rules = platformRules[platform];
    
    // Variation 1: Direct approach
    const directHook = `${niche} for ${audience}`;
    const directValue = goal === 'Authority' ? 'Expert insights daily' : 'Practical tips that work';
    const directCTA = generateCTALine(goal, style);
    variations.push(rules.lineBreaks 
        ? `${directHook}\n${directValue}\n${directCTA}`
        : `${directHook}. ${directValue}. ${directCTA}`
    );
    
    // Variation 2: Outcome-focused
    const outcomeHooks = {
        Followers: `Grow your ${niche} knowledge`,
        DMs: `Ready to level up your ${niche}?`,
        Sales: `${niche} products that deliver`,
        Authority: `${niche} expertise for ${audience}`
    };
    const outcomeHook = outcomeHooks[goal];
    const outcomeValue = `Built for ${audience}`;
    variations.push(rules.lineBreaks
        ? `${outcomeHook}\n${outcomeValue}\n${directCTA}`
        : `${outcomeHook}. ${outcomeValue}. ${directCTA}`
    );
    
    // Variation 3: Story angle
    const storyHook = `From ${audience}, for ${audience}`;
    const storyValue = `Sharing everything about ${niche}`;
    variations.push(rules.lineBreaks
        ? `${storyHook}\n${storyValue}\n${directCTA}`
        : `${storyHook}. ${storyValue}. ${directCTA}`
    );
    
    return variations;
}

function generateContent() {
    const { platform, niche, audience, goal, style, output } = currentState;
    
    const results = {};
    
    switch (output) {
        case 'Hook_Line':
            results.hook = generateHookLine(niche, audience, goal, platform);
            break;
        case 'CTA_Line':
            results.cta = generateCTALine(goal, style);
            break;
        case 'Bio':
            results.bio = generateFullBio(platform, niche, audience, goal, style);
            break;
        case 'Variations':
            results.variations = generateVariations(platform, niche, audience, goal, style);
            break;
        case 'All':
            results.hook = generateHookLine(niche, audience, goal, platform);
            results.bio = generateFullBio(platform, niche, audience, goal, style);
            results.cta = generateCTALine(goal, style);
            results.variations = generateVariations(platform, niche, audience, goal, style);
            break;
    }
    
    return results;
}

// ========================================
// UI RENDERING
// ========================================
function renderResults(results) {
    resultsContainer.innerHTML = '';
    
    if (results.hook) {
        resultsContainer.appendChild(createResultCard('Hook Line', results.hook));
    }
    
    if (results.bio) {
        resultsContainer.appendChild(createResultCard('Bio', results.bio));
    }
    
    if (results.cta) {
        resultsContainer.appendChild(createResultCard('CTA Line', results.cta));
    }
    
    if (results.variations) {
        const variationsWrapper = document.createElement('div');
        variationsWrapper.className = 'variations-wrapper';
        
        results.variations.forEach((variation, index) => {
            variationsWrapper.appendChild(createVariationCard(index + 1, variation));
        });
        
        resultsContainer.appendChild(variationsWrapper);
    }
    
    resultsSection.classList.remove('hidden');
}

function createResultCard(label, content) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
        <div class="result-label">${label}</div>
        <div class="result-content">${escapeHtml(content)}</div>
        <div class="result-actions">
            <button class="copy-btn" data-content="${escapeHtml(content)}">
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
            <button class="variation-copy-btn" data-content="${escapeHtml(content)}">Copy</button>
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
    // Remove existing toast
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
        showToast('Please enter your niche', true);
        nicheInput.focus();
        return false;
    }
    
    if (!currentState.audience) {
        showToast('Please enter your audience', true);
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
    
    // Show loading state
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = generateBtn.querySelector('.btn-loader');
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    generateBtn.disabled = true;
    
    // Simulate brief processing (feels more intentional)
    await new Promise(resolve => setTimeout(resolve, 400));
    
    try {
        const results = generateContent();
        renderResults(results);
        
        // Scroll to results
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
    } catch (error) {
        showToast('Something went wrong', true);
        console.error(error);
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

// Enter key to generate
[nicheInput, audienceInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGenerate();
        }
    });
});

// Prevent zoom on double tap for iOS
document.addEventListener('dblclick', (e) => {
    e.preventDefault();
}, { passive: false });
