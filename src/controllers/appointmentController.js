const { v4: uuidv4 } = require("uuid");
const { getContainers } = require("../cosmosdb");
const { triggerSalesforceSync } = require("../utils/salesforceSync");

async function createAppointment(req, res) {
    try {
        const {
            patientId, patientEmail, patientName,
            doctorId, doctorName, specialization,
            appointmentDate, appointmentTime, symptoms,
        } = req.body;

        if (!patientId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                error: "patientId, appointmentDate, and appointmentTime are required.",
            });
        }

        const { appointmentsContainer } = getContainers();

        const appointment = {
            id: uuidv4(),
            patientId,
            patientEmail: patientEmail || "",
            patientName: patientName || "",
            doctorId: doctorId || "",
            doctorName: doctorName || "",
            specialization: specialization || "",
            appointmentDate,
            appointmentTime,
            symptoms: symptoms || "",
            status: "submitted",
            createdAt: new Date().toISOString(),
        };

        const { resource } = await appointmentsContainer.items.create(appointment);

        // Salesforce Sync
        await triggerSalesforceSync(resource, "appointment");

        return res.status(201).json({
            message: "Appointment booked successfully.",
            appointment: resource,
        });
    } catch (err) {
        console.error("[appointmentController.createAppointment]", err);
        res.status(500).json({ error: "Failed to book appointment.", details: err.message });
    }
}

async function getAppointments(req, res) {
    try {
        const { patientId } = req.params;
        const { appointmentsContainer } = getContainers();

        const { resources } = await appointmentsContainer.items
            .query(
                {
                    query: "SELECT * FROM c WHERE c.patientId = @pid ORDER BY c.createdAt DESC",
                    parameters: [{ name: "@pid", value: patientId }],
                },
                { partitionKey: patientId, enableCrossPartitionQuery: true }
            )
            .fetchAll();

        res.json({ appointments: resources });
    } catch (err) {
        console.error("[appointmentController.getAppointments]", err);
        res.status(500).json({ error: "Failed to fetch appointments.", details: err.message });
    }
}

module.exports = { createAppointment, getAppointments };
