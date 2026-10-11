
function loadGA() {
    // Dynamically load the GA script
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-5YGZ8K86JH';
    document.head.appendChild(gaScript);
    gaScript.onload = function() {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-5YGZ8K86JH');
    };
}

function setGameEnabled(enabled) {
    // Disable or enable all game buttons
    const buttons = document.querySelectorAll('.level-button');
    buttons.forEach(btn => {
        if (btn.id !== 'consent-accept' && btn.id !== 'consent-reject') {
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.5';
            btn.style.pointerEvents = enabled ? 'auto' : 'none';
        }
    });
    // Optionally, disable other interactive elements here
}

function showConsentPopup() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramConsent = urlParams.get('consent');

    // 1. If coming from the main menu with verified consent, save it immediately
    if (paramConsent === '1') {
        localStorage.setItem('ga_consent', 'true');
    }

    const consent = localStorage.getItem('ga_consent');

    if (consent === 'true') {
        setGameEnabled(true);
        loadGA();
    } else if (consent === 'false') {
        setGameEnabled(true);
    } else {
        // Only show if the user directly bookmarked the game without visiting the home page
        const popup = document.getElementById('consent-popup');
        if (popup) popup.style.display = 'block';
        setGameEnabled(false);
    }
}
function acceptConsent() {
    localStorage.setItem('ga_consent', 'true');
    document.getElementById('consent-popup').style.display = 'none';
    setGameEnabled(true);
    loadGA();
}
function rejectConsent() {
    localStorage.setItem('ga_consent', 'false');
    document.getElementById('consent-popup').style.display = 'none';
    setGameEnabled(true); // Allow game interaction even if GA is rejected
}
document.addEventListener('DOMContentLoaded', function() {
    showConsentPopup();
    document.getElementById('consent-accept').onclick = acceptConsent;
    document.getElementById('consent-reject').onclick = rejectConsent;
});
