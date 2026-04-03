const axios = require("axios");

/**
 * Triggers the Salesforce synchronization by calling an Azure Function.
 * @param {Object} data - The data to be synchronized (e.g., patient or appointment object).
 * @param {string} type - The type of synchronization ('patient' or 'appointment').
 */
async function triggerSalesforceSync(data, type) {
    const url = process.env.AZURE_FUNCTION_URL;
    const key = process.env.AZURE_FUNCTION_KEY;

    if (!url) {
        console.warn("[salesforceSync] AZURE_FUNCTION_URL is not defined. Skipping sync.");
        return;
    }

    try {
        console.log(`[salesforceSync] Triggering ${type} sync for:`, data.id || data.email);

        const response = await axios.post(url, {
            type,
            data
        }, {
            headers: {
                "Content-Type": "application/json",
                "x-functions-key": key
            },
            timeout: 10000 // 10 second timeout
        });

        console.log(`[salesforceSync] ${type} sync successful:`, response.status, response.data);
    } catch (err) {
        console.error(`[salesforceSync] ${type} sync failed:`, err.message);
        if (err.response) {
            console.error(`[salesforceSync] Response error:`, err.response.data);
        }
        // We don't throw the error so the main process (registration/booking) can continue
    }
}

module.exports = { triggerSalesforceSync };
