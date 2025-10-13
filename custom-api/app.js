import express from "express";
import dayjs from "dayjs";

const app = express();
const PORT = 3000;

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDuration(millis) {
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    if (millis < MINUTE) {
        return `${Math.trunc(millis / SECOND)}s`;
    } else if (millis < HOUR) {
        return `${Math.trunc(millis / MINUTE)}min`;
    } else if (millis < DAY) {
        return `${Math.trunc(millis / HOUR)}h`;
    } else {
        return `${Math.trunc(millis / DAY)}d`;
    }
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
    let result = await deviceStats.json();

    // REMOVEME: manual tampering with the response obj for testing
    const currentDate = dayjs();
    Object.keys(result).forEach((key) => {
        const lastSeen = dayjs(result[key].lastSeen);
        const dateDiff = currentDate.diff(lastSeen);
        result[key].sinceLastSeen = formatDuration(dateDiff);
    });
    // END REMOVEME
    res.send(result);
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
