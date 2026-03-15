// ─────────────────────────────────────────────────────────────
// backend/routes/doctors.js
// ─────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { getDoctors } = require("../controllers/doctorController");

router.get("/doctors", getDoctors);

module.exports = router;
