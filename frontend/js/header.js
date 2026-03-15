/**
 * header.js
 * Dynamically injects the global header bar and handles logout logic.
 */

(function () {
    const headerHTML = `
    <header class="main-header">
        <div class="header-container">
            <a href="index.html" class="header-brand">
                <span class="logo-emoji">🏥</span>
                <span class="brand-text">Healthcare</span>
            </a>
            <nav class="header-nav" id="headerNav">
                <!-- Links will be injected here by JS -->
            </nav>
        </div>
    </header>
    `;

    // Inject header styles if not already present (alternative to modifying styles.css if needed, 
    // but we will modify styles.css for better performance)

    function initHeader() {
        if (document.querySelector('.main-header')) return;
        const body = document.body;
        const headerContainer = document.createElement('div');
        headerContainer.innerHTML = headerHTML;
        body.insertBefore(headerContainer.firstElementChild, body.firstChild);

        updateHeaderNav();
    }

    function updateHeaderNav() {
        const nav = document.getElementById('headerNav');
        const patientData = sessionStorage.getItem('patient');

        if (patientData) {
            const patient = JSON.parse(patientData);
            nav.innerHTML = `
                <div class="user-profile">
                    <span class="user-name">Welcome, ${patient.name}</span>
                    <button id="logoutBtn" class="btn-logout">Logout</button>
                </div>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => {
                sessionStorage.removeItem('patient');
                window.location.href = 'login.html';
            });
        } else {
            const host = window.location.pathname;
            const isLoginPage = host.endsWith('login.html') || host === '/';
            const isRegisterPage = host.endsWith('register.html');

            nav.innerHTML = `
                ${!isLoginPage ? '<a href="login.html" class="nav-link">Sign In</a>' : ''}
                ${!isRegisterPage ? '<a href="register.html" class="nav-link">Register</a>' : ''}
            `;
        }
    }

    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeader);
    } else {
        initHeader();
    }
})();
