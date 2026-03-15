// ─────────────────────────────────────────────────────────────
// backend/controllers/doctorController.js
// ─────────────────────────────────────────────────────────────
const { getContainers } = require("../cosmosdb");

// ── GET /api/doctors ──────────────────────────────────────
async function getDoctors(req, res) {
    try {
        const { doctorsContainer } = getContainers();
        const { resources } = await doctorsContainer.items
            .query("SELECT * FROM c WHERE c.available = true", {
                enableCrossPartitionQuery: true,
            })
            .fetchAll();

        res.json({ doctors: resources });
    } catch (err) {
        console.error("[doctorController.getDoctors]", err);
        res.status(500).json({ error: "Failed to fetch doctors.", details: err.message });
    }
}

module.exports = { getDoctors };
