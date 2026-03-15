// ─────────────────────────────────────────────────────────────
// frontend/js/login.js
// Login page logic — calls POST /api/login, redirects based on response
// ─────────────────────────────────────────────────────────────

const API_BASE = "";  // same origin; empty string means relative URL

function showAlert(type, message) {
    const box = document.getElementById("alertBox");
    box.className = `alert-custom alert-${type}-custom`;
    box.textContent = message;
    box.style.display = "block";
}

function hideAlert() {
    const box = document.getElementById("alertBox");
    box.style.display = "none";
}

function setLoading(loading) {
    const btn = document.getElementById("loginBtn");
    const text = document.getElementById("loginBtnText");
    const spinner = document.getElementById("loginSpinner");
    btn.disabled = loading;
    text.textContent = loading ? "Checking..." : "Continue";
    spinner.classList.toggle("d-none", !loading);
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value;

    if (!identifier || !password) {
        showAlert("error", "Please enter both identifier and password.");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed. Please try again.");
        }

        if (data.redirect === "appointment") {
            // Store patient info in sessionStorage for the appointment page
            sessionStorage.setItem("patient", JSON.stringify(data.patient));
            showAlert("success", `Welcome back, ${data.patient.name}! Redirecting...`);
            setTimeout(() => { window.location.href = "appointment.html"; }, 1200);
        } else {
            // Patient not found — redirect to registration
            sessionStorage.setItem("loginIdentifier", identifier);
            showAlert("info", "No account found. Redirecting to registration...");
            setTimeout(() => { window.location.href = "register.html"; }, 1200);
        }
    } catch (err) {
        showAlert("error", err.message);
    } finally {
        setLoading(false);
    }
});
