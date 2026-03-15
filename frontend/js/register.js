// ─────────────────────────────────────────────────────────────
// frontend/js/register.js
// Registration form logic — calls POST /api/register
// ─────────────────────────────────────────────────────────────

const API_BASE = "";

function showAlert(type, message) {
    const box = document.getElementById("alertBox");
    box.className = `alert-custom alert-${type}-custom`;
    box.textContent = message;
    box.style.display = "block";
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideAlert() {
    document.getElementById("alertBox").style.display = "none";
}

function setLoading(loading) {
    const btn = document.getElementById("registerBtn");
    const text = document.getElementById("registerBtnText");
    const spinner = document.getElementById("registerSpinner");
    btn.disabled = loading;
    text.textContent = loading ? "Registering..." : "Create Patient Account";
    spinner.classList.toggle("d-none", !loading);
}

// Pre-fill email/phone if redirected from login
window.addEventListener("DOMContentLoaded", () => {
    const identifier = sessionStorage.getItem("loginIdentifier");
    if (identifier) {
        const emailField = document.getElementById("email");
        const phoneField = document.getElementById("phone");
        if (identifier.includes("@")) {
            emailField.value = identifier;
        } else {
            phoneField.value = identifier;
        }
    }

    // Set max date for DOB to today
    const dobInput = document.getElementById("dob");
    const ageInput = document.getElementById("age");
    dobInput.max = new Date().toISOString().split("T")[0];

    // ── Auto-calculate age from DOB ───────────────────────────
    dobInput.addEventListener("change", () => {
        const birthDate = new Date(dobInput.value);
        if (isNaN(birthDate.getTime())) {
            ageInput.value = "";
            return;
        }

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        ageInput.value = age >= 0 ? age : 0;
    });
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value.trim();
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const bloodGroup = document.getElementById("bloodGroup").value;
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const countryCode = document.getElementById("countryCode").value;
    const address = document.getElementById("address").value.trim();
    const medicalHistory = document.getElementById("medicalHistory").value.trim();
    const password = document.getElementById("password").value;

    // File inputs
    const identityProofFile = document.getElementById("identityProof").files[0];
    const medicalReportFile = document.getElementById("medicalReport").files[0];

    // Validation
    if (!name) { showAlert("error", "Full name is required."); return; }
    if (!password || password.length < 6) { showAlert("error", "Password must be at least 6 characters."); return; }
    if (!age || age < 1 || age > 120) { showAlert("error", "Please enter a valid age (1–120)."); return; }
    if (!dob) { showAlert("error", "Date of birth is required."); return; }
    if (!gender) { showAlert("error", "Please select a gender."); return; }
    if (!bloodGroup) { showAlert("error", "Please select a blood group."); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAlert("error", "Please enter a valid email address."); return;
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
        showAlert("error", "Please enter a valid 10-digit phone number."); return;
    }
    // Helper to validate and read file
    const processFile = async (file, isRequired = false) => {
        if (!file) {
            if (isRequired) throw new Error("Identity Proof is required.");
            return "";
        }

        // Limit: 2MB
        const MAX_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            throw new Error(`File "${file.name}" exceeds the 2MB limit.`);
        }

        // Type check
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`File "${file.name}" has an invalid type. Only PDF, JPG, and PNG are allowed.`);
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    try {
        const identityProofBase64 = await processFile(identityProofFile, true);
        const medicalReportBase64 = await processFile(medicalReportFile, false);

        const response = await fetch(`${API_BASE}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name, age: Number(age), dob, gender, bloodGroup,
                email, phone, countryCode, address, medicalHistory, password,
                identityProof: identityProofBase64,
                medicalReport: medicalReportBase64
            }),
        });

        const data = await response.json();

        if (response.status === 409) {
            // Already registered — redirect to appointment
            sessionStorage.setItem("patient", JSON.stringify(data.patient));
            showAlert("info", "Account already exists. Redirecting to appointment booking...");
            setTimeout(() => { window.location.href = "appointment.html"; }, 1500);
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || "Registration failed.");
        }

        // Success
        sessionStorage.setItem("patient", JSON.stringify(data.patient));
        sessionStorage.removeItem("loginIdentifier");
        showAlert("success", "Registration successful! Redirecting to appointment booking...");
        setTimeout(() => { window.location.href = "appointment.html"; }, 1500);

    } catch (err) {
        showAlert("error", err.message);
    } finally {
        setLoading(false);
    }
});
