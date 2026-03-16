require("dotenv").config();
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DATABASE || "HealthcareCRM";

if (!endpoint || endpoint.includes("<your-cosmosdb-account>")) {
    console.error("\nCOSMOS_ENDPOINT is not set correctly in your .env file.");
    console.error("Copy .env.example to .env and fill in your real Cosmos DB credentials.");
    console.error("Current value:", endpoint || "(undefined)");
    process.exit(1);
}
if (!key || key.includes("<your-cosmosdb-primary-key>")) {
    console.error("\nCOSMOS_KEY is not set correctly in your .env file.");
    process.exit(1);
}

const client = new CosmosClient({ endpoint, key });

let patientsContainer;
let appointmentsContainer;

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
