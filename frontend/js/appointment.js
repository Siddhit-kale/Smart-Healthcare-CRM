// ─────────────────────────────────────────────────────────────
// frontend/js/appointment.js
// Appointment booking page logic
// ─────────────────────────────────────────────────────────────

const API_BASE = "";
let patient = null;

// ── On page load ────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
    // Guard: must be logged in
    const stored = sessionStorage.getItem("patient");
    if (!stored) {
        window.location.href = "login.html";
        return;
    }
    patient = JSON.parse(stored);
    document.getElementById("patientNameDisplay").textContent = patient.name || "Patient";

    // Set min appointment date to today
    const dateInput = document.getElementById("appointmentDate");
    dateInput.min = new Date().toISOString().split("T")[0];

    await loadAppointments();
});

// ── Logout ───────────────────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "login.html";
});

// ── Doctor selection removed ──

// ── Show alert ───────────────────────────────────────────────
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

// ── Book appointment form submit ─────────────────────────────
document.getElementById("appointmentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const appointmentDate = document.getElementById("appointmentDate").value;
    const appointmentTime = document.getElementById("appointmentTime").value;
    const symptoms = document.getElementById("symptoms").value.trim();

    if (!appointmentDate) { showAlert("error", "Please select an appointment date."); return; }
    if (!appointmentTime) { showAlert("error", "Please select a time slot."); return; }

    const btn = document.getElementById("bookBtn");
    const text = document.getElementById("bookBtnText");
    const spinner = document.getElementById("bookSpinner");
    btn.disabled = true;
    text.textContent = "Booking...";
    spinner.classList.remove("d-none");

    try {
        const res = await fetch(`${API_BASE}/api/appointment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patientId: patient.id,
                patientEmail: patient.email,
                patientName: patient.name,
                appointmentDate,
                appointmentTime,
                symptoms,
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Booking failed.");

        showAlert("success",
            `✅ Appointment booked for ${appointmentDate} at ${appointmentTime}.`
        );

        // Reset form
        document.getElementById("appointmentForm").reset();

        // Reload history
        await loadAppointments();
    } catch (err) {
        showAlert("error", err.message);
    } finally {
        btn.disabled = false;
        text.textContent = "📅 Book Appointment";
        spinner.classList.add("d-none");
    }
});

// ── Load appointment history ─────────────────────────────────
async function loadAppointments() {
    const listEl = document.getElementById("appointmentList");
    if (!patient || !patient.id) return;

    try {
        const res = await fetch(`${API_BASE}/api/appointments/${patient.id}`);
        const data = await res.json();

        const appts = data.appointments || [];
        if (appts.length === 0) {
            listEl.innerHTML = `<p style="color:var(--text-muted); font-size:0.87rem; text-align:center;">No appointments yet.</p>`;
            return;
        }

        listEl.innerHTML = appts.map(a => `
      <div class="appt-list-item">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div style="font-weight:600; color:#fff; font-size:0.95rem;">📅 ${a.appointmentDate}</div>
            <div style="color:var(--secondary); font-size:0.8rem;">🕐 ${a.appointmentTime}</div>
          </div>
          <span class="status-badge status-${a.status || 'submitted'}">${a.status || "submitted"}</span>
        </div>
        ${a.symptoms ? `<div style="margin-top:6px; font-size:0.82rem; color:var(--text-muted);">💬 ${a.symptoms}</div>` : ""}
      </div>
    `).join("");
    } catch (err) {
        listEl.innerHTML = `<p style="color:var(--accent); font-size:0.87rem;">Could not load appointments: ${err.message}</p>`;
    }
}
