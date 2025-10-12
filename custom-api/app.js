import express from "express";

const app = express();
const PORT = 3000;

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

app.get("/mensa/:id", async (req, res) => {
    const { id } = req.params;
    const date = getCurrentDate();

    const mensaUrl = "https://openmensa.org/api/v2";
    const mealUri = `${mensaUrl}/canteens/${id}/days/${date}/meals`;

    const mensaResponse = await fetch(mealUri);
    if (!mensaResponse.ok) {
        if (mensaResponse.status === 404) {
            mealStatusMessage = "No meals found for today.";
        } else {
            mealStatusMessage = "Fetching Mensa failed.";
        }
        res.status(500).send({ error: mealStatusMessage });
    } else {
        const result = await mensaResponse.json();
        res.send(result);
    }
});

app.get("/syncthing/folders", async (req, res) => {
    const baseUrl = process.env.SYNCTHING_BASE_URL;
    const endpoints = {
        stats: "/rest/stats/device",
    };
    const apiKey = process.env.SYNCTHING_API_KEY;

    const deviceStats = await fetch(`${baseUrl}${endpoints.stats}`, {
        method: "GET",
        headers: {
            "X-API-Key": apiKey,
        },
    });
    const result = await deviceStats.json();
    res.send(result);
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
