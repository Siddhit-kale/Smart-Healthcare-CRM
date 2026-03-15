// ─────────────────────────────────────────────────────────────
// controllers/authController.js
// Handles patient login and registration
// ─────────────────────────────────────────────────────────────
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { getContainers } = require("../cosmosdb");

async function login(req, res) {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ error: "Email/phone and password are required." });
        }

        const { patientsContainer } = getContainers();

        const query = {
            query: "SELECT * FROM c WHERE c.email = @id OR c.phone = @id",
            parameters: [{ name: "@id", value: identifier.trim() }],
        };

        const { resources } = await patientsContainer.items
            .query(query, { enableCrossPartitionQuery: true })
            .fetchAll();

        if (resources.length > 0) {
            const patient = resources[0];

            const isMatch = await bcrypt.compare(password, patient.passwordHash || "");
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid password." });
            }

            return res.json({
                redirect: "appointment",
                patient: {
                    id: patient.id,
                    name: patient.name,
                    email: patient.email,
                    phone: patient.phone,
                },
            });
        }

        return res.json({ redirect: "register" });
    } catch (err) {
        console.error("[authController.login]", err);
        res.status(500).json({ error: "Login failed.", details: err.message });
    }
}

async function register(req, res) {
    try {
        const {
            name, age, gender, bloodGroup, dob,
            phone, countryCode, email, address, medicalHistory,
            identityProof, medicalReport, password
        } = req.body;

        if (!name || !email || !phone || !identityProof || !password) {
            return res.status(400).json({
                error: "Name, email, phone, identity proof, and password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        const { patientsContainer } = getContainers();

        const { resources: existing } = await patientsContainer.items
            .query({
                query: "SELECT * FROM c WHERE c.email = @email",
                parameters: [{ name: "@email", value: email.trim().toLowerCase() }],
            }, { enableCrossPartitionQuery: true })
            .fetchAll();

        if (existing.length > 0) {
            return res.status(409).json({
                error: "Patient with this email already exists.",
                redirect: "appointment",
                patient: existing[0]
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const patient = {
            id: uuidv4(),
            name: name.trim(),
            age: Number(age),
            gender,
            bloodGroup,
            dob,
            phone: phone.trim(),
            countryCode: countryCode || "+91",
            email: email.trim().toLowerCase(),
            address,
            medicalHistory: medicalHistory || "",
            passwordHash,
            identityProof,
            medicalReport: medicalReport || "",
            registrationDate: new Date().toISOString(),
        };

        const { resource } = await patientsContainer.items.create(patient);

        return res.status(201).json({ message: "Patient registered successfully.", patient: resource });
    } catch (err) {
        console.error("[authController.register]", err);
        res.status(500).json({ error: "Registration failed.", details: err.message });
    }
}

module.exports = { login, register };
