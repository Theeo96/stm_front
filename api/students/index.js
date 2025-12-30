// In-memory storage for the latest student data
// Note: This data may be reset if the Azure Function stays idle for too long (Cold Start).
// For permanent storage, connect to a database like CosmosDB.
let studentsCache = [];

module.exports = async function (context, req) {
    // GET request: Return the current data
    if (req.method === "GET") {
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: studentsCache
        };
        return;
    }

    // POST request: Update the data
    if (req.method === "POST") {
        const incomingData = req.body;

        if (!Array.isArray(incomingData)) {
            context.res = {
                status: 400,
                body: "Invalid data format. Expected a JSON array."
            };
            return;
        }

        // Simple merge/replace strategy
        // If the array is empty, we might keep the old cache? 
        // For now, we assume the POST contains the active list of "changed" or "all" items.
        // To support "Active Persistence", we merge logic here.

        // Strategy: 
        // 1. Loop through incoming data
        // 2. Update existing student in cache OR push new one
        incomingData.forEach(incoming => {
            const index = studentsCache.findIndex(s =>
                (incoming.id && s.id === incoming.id) ||
                (s.name === incoming.name)
            );

            if (index !== -1) {
                // Update existing
                studentsCache[index] = { ...studentsCache[index], ...incoming };
            } else {
                // Add new
                studentsCache.push(incoming);
            }
        });

        // Log the successful update
        context.log(`Updated ${incomingData.length} students. Cache size: ${studentsCache.length}`);

        // Return success response for POST
        context.res = {
            status: 200,
            body: { message: "Data updated successfully", currentCount: studentsCache.length }
        };
        return;
    }

    // DELETE request: Clear the data
    if (req.method === "DELETE") {
        studentsCache.length = 0; // Clear the array
        context.log("Students cache cleared.");
        context.res = {
            status: 200,
            body: { message: "Data cleared successfully" }
        };
        return;
    }
};
