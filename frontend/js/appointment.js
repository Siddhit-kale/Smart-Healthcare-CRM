const API_BASE = "";
let patient = null;

window.addEventListener("DOMContentLoaded", async () => {
    const stored = sessionStorage.getItem("patient");
    if (!stored) {
        window.location.href = "login.html";
        return;
    }
    patient = JSON.parse(stored);
    document.getElementById("patientNameDisplay").textContent = patient.name || "Patient";

    const dateInput = document.getElementById("appointmentDate");
    if (dateInput) {
        dateInput.min = new Date().toISOString().split("T")[0];
    }

    // Bind form submission
    const form = document.getElementById("appointmentForm");
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    } else {
        console.error("appointmentForm not found in DOM!");
    }

    // Bind logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.clear();
            window.location.href = "login.html";
        });
    }

    await loadAppointments();
});

function showAlert(type, message) {
    const box = document.getElementById("alertBox");
    if (!box) return;
    box.className = `alert-custom alert-${type}-custom`;
    box.textContent = message;
    box.style.display = "block";
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideAlert() {
    const box = document.getElementById("alertBox");
    if (box) box.style.display = "none";
}

async function handleFormSubmit(e) {
    e.preventDefault();
    hideAlert();
    console.log("[Booking] Submit triggered");

    const dateInput = document.getElementById("appointmentDate");
    const timeInput = document.getElementById("appointmentTime");
    const symptomsInput = document.getElementById("symptoms");

    if (!dateInput || !timeInput || !symptomsInput) {
        console.error("Form inputs missing!");
        return;
    }

    const appointmentDate = dateInput.value;
    const appointmentTime = timeInput.value;
    const symptoms = symptomsInput.value.trim();

    if (!appointmentDate) { showAlert("error", "Please select an appointment date."); return; }
    if (!appointmentTime) { showAlert("error", "Please select a time slot."); return; }

    const btn = document.getElementById("bookBtn");
    const text = document.getElementById("bookBtnText");
    const spinner = document.getElementById("bookSpinner");

    if (btn) btn.disabled = true;
    if (text) text.textContent = "Booking...";
    if (spinner) spinner.classList.remove("d-none");

    try {
        console.log("[Booking] Sending data:", {
            patientId: patient.id,
            patientEmail: patient.email,
            patientName: patient.name,
            appointmentDate,
            appointmentTime,
            symptoms,
        });

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
        console.log("[Booking] Response:", data);

        if (!res.ok) throw new Error(data.error || "Booking failed.");

        showAlert("success", `✅ Appointment booked for ${appointmentDate} at ${appointmentTime}.`);
        document.getElementById("appointmentForm").reset();
        await loadAppointments();
    } catch (err) {
        console.error("[Booking] Error:", err);
        showAlert("error", err.message);
    } finally {
        if (btn) btn.disabled = false;
        if (text) text.textContent = "📅 Book Appointment";
        if (spinner) spinner.classList.add("d-none");
    }
}

async function loadAppointments() {
    console.log("[Loading] loadAppointments called");
    const listEl = document.getElementById("appointmentList");
    if (!listEl) return;

    if (!patient || !patient.id) {
        console.error("[Loading] No patient data found in session.");
        return;
    }

    try {
        console.log("[Loading] Fetching appointments for patient:", patient.id);
        const res = await fetch(`${API_BASE}/api/appointments/${patient.id}`);
        const data = await res.json();
        console.log("[Loading] Response:", data);

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
        console.error("[Loading] Error:", err);
        listEl.innerHTML = `<p style="color:var(--accent); font-size:0.87rem;">Could not load appointments: ${err.message}</p>`;
    }
}

