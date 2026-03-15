// ─────────────────────────────────────────────────────────────
// cosmosdb.js (Root)
// Azure Cosmos DB client + container initialisation
// ─────────────────────────────────────────────────────────────
require("dotenv").config();
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DATABASE || "HealthcareCRM";

// ── Validate required env vars before creating the client ─────
if (!endpoint || endpoint.includes("<your-cosmosdb-account>")) {
    console.error("\n❌  COSMOS_ENDPOINT is not set correctly in your .env file.");
    process.exit(1);
}
if (!key || key.includes("<your-cosmosdb-primary-key>")) {
    console.error("\n❌  COSMOS_KEY is not set correctly in your .env file.");
    process.exit(1);
}

const client = new CosmosClient({ endpoint, key });

// Container refs (populated after init)
let patientsContainer;
let appointmentsContainer;

// ── Initialise database & containers ─────────────────────────
async function initCosmosDB() {
    const { database } = await client.databases.createIfNotExists({
        id: dbName,
        throughput: 400
    });

    const [pc, ac] = await Promise.all([
        database.containers.createIfNotExists({
            id: process.env.COSMOS_PATIENTS_CONTAINER || "patients",
            partitionKey: { paths: ["/email"] },
        }),
        database.containers.createIfNotExists({
            id: process.env.COSMOS_APPOINTMENTS_CONTAINER || "appointments",
            partitionKey: { paths: ["/patientId"] },
        }),
    ]);

    patientsContainer = pc.container;
    appointmentsContainer = ac.container;

    console.log("[CosmosDB] Initialised successfully.");
}

function getContainers() {
    return { patientsContainer, appointmentsContainer };
}

module.exports = { initCosmosDB, getContainers };
