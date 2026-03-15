# Azure Cosmos DB — Schema Reference

**Database name:** `HealthcareCRM`  
**API:** Core (SQL)  
**Tier:** Free Tier (400 RU/s, 25 GB)

---

## Container: `patients`

**Partition Key:** `/email`

| Field           | Type   | Description                                      |
|-----------------|--------|--------------------------------------------------|
| id              | string | UUID — auto-generated                            |
| name            | string | Full name of the patient                         |
| age             | number | Patient age                                      |
| gender          | string | Male / Female / Other                            |
| bloodGroup      | string | A+, A-, B+, B-, AB+, AB-, O+, O-                |
| dob             | string | Date of birth (ISO 8601: YYYY-MM-DD)             |
| phone             | string | Patient phone number (10 digits)                |
| countryCode       | string | Country code (e.g., +91, +1)                    |
| email             | string | Patient email (unique, partition key)           |
| address           | string | Residential address                             |
| medicalHistory    | string | Past medical conditions, allergies, etc.        |
| identityProof     | string | Base64 encoded identity document                |
| medicalReport     | string | Base64 encoded past medical report (optional)   |
| passwordHash      | string | BCrypt hash of user password                    |
| registrationDate  | string | ISO 8601 timestamp                              |
| _ts             | number | Cosmos DB internal timestamp                     |

---

## Container: `appointments`

**Partition Key:** `/patientId`

| Field           | Type   | Description                                     |
|-----------------|--------|-------------------------------------------------|
| id              | string | UUID — auto-generated                           |
| patientId       | string | References `patients.id`                        |
| patientEmail    | string | Patient email for quick lookup                  |
| patientName     | string | Patient full name                               |
| appointmentDate | string | Date of appointment (YYYY-MM-DD)                |
| appointmentTime | string | Time of appointment (HH:MM)                     |
| symptoms        | string | Patient-reported symptoms                       |
| status          | string | submitted / cancelled / completed                |
| createdAt       | string | ISO 8601 timestamp                              |
| createdAt       | string | ISO 8601 timestamp                              |


