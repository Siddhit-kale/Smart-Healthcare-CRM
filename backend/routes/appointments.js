const express = require("express");
const router = express.Router();
const {
    createAppointment,
    getAppointments,
} = require("../controllers/appointmentController");

router.post("/appointment", createAppointment);
router.get("/appointments/:patientId", getAppointments);

module.exports = router;
