// ─────────────────────────────────────────────────────────────
// backend/server.js
// Express application entry point
// ─────────────────────────────────────────────────────────────
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const { initCosmosDB } = require("./cosmosdb");

const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ── Serve frontend static files ────────────────────────────
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ── API Routes ─────────────────────────────────────────────
app.use("/api", authRoutes);
app.use("/api", appointmentRoutes);

// ── Health check ───────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// ── Root → serve homepage ─────────────────────────────────
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
    console.error("[Error]", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
});

// ── Start ─────────────────────────────────────────────────
(async () => {
    try {
        await initCosmosDB();
        app.listen(PORT, () => {
            console.log(`\Smart Healthcare CRM running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("[FATAL] Failed to start server:", err.message);
        process.exit(1);
    }
})();
