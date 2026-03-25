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

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use("/api", authRoutes);
app.use("/api", appointmentRoutes);
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, req, res, next) => {
    console.error("[Error]", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
});

(async () => {
    try {
        await initCosmosDB();
        console.log("Cosmos DB connected");
    } catch (err) {
        console.error("Cosmos DB connection failed:", err.message);
    }

    app.listen(PORT, () => {
        console.log(`Smart Healthcare CRM running on port ${PORT}`);
    });
})();
