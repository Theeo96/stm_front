// In-memory storage for the meeting schedule
// Note: This data may be reset if the Azure Function stays idle for too long (Cold Start).
let meetingsCache = [];

module.exports = async function (context, req) {
    // GET request: Return the current data
    if (req.method === "GET") {
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: meetingsCache
        };
        return;
    }

    // POST request: Update the data (Overwrite)
    if (req.method === "POST") {
        const incomingData = req.body;

        if (!Array.isArray(incomingData)) {
            context.res = {
                status: 400,
                body: "Invalid data format. Expected a JSON array."
            };
            return;
        }

        // Full Overwrite Strategy for Meetings (as requested for simplicity/consistency with student logic logic)
        // User said: "send this json format... to display it there"
        // Implicitly implies replacing the schedule.
        meetingsCache = incomingData;

        // Log the successful update
        context.log(`Updated meetings schedule. Count: ${meetingsCache.length}`);

        // Return success response for POST
        context.res = {
            status: 200,
            body: { message: "Meeting schedule updated successfully", currentCount: meetingsCache.length }
        };
        return;
    }
};
