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

async function handleResponse(response) {
    if (response.ok) {
        try {
            const data = await response.json();
            return { ok: true, status: 200, value: data };
        } catch (e) {
            return { ok: false, status: 500 };
        }
    }

    return { ok: false, status: response.status };
}

function formatDuration(millis) {
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    if (millis < MINUTE) return `${Math.trunc(millis / SECOND)}s`;
    if (millis < HOUR) return `${Math.trunc(millis / MINUTE)}min`;
    if (millis < DAY) return `${Math.trunc(millis / HOUR)}h`;
    return `${Math.trunc(millis / DAY)}d`;
}

function sinceLastSeenFrom(lastSeen, now) {
    const lastSeenParsed = dayjs(lastSeen);
    if (lastSeenParsed.isSame("1970-01-01", "day")) return "never";
    return formatDuration(now.diff(lastSeen));
}

app.get("/mensa/:id", async (req, res) => {
    const { id } = req.params;
    const date = getCurrentDate();
    const mensaUrl = "https://openmensa.org/api/v2";
    const mealUri = `${mensaUrl}/canteens/${id}/days/${date}/meals`;

    const mensaResponse = await handleResponse(await fetch(mealUri));
    if (!mensaResponse.ok) {
        let mealStatusMessage = "Fetching Mensa failed.";
        if (mensaResponse.status === 404) {
            // assume server is reachable
            const mensaInfo = await handleResponse(
                await fetch(`${mensaUrl}/canteens/${id}`)
            );
            mealStatusMessage = `No meals found for today. Mensa: ${mensaInfo.value?.name}`;
        }
        res.status(500).send({ error: mealStatusMessage });
        return;
    }

    res.send(mensaResponse.value);
});

app.get("/syncthing/devices", async (req, res) => {
    const env =
        typeof process !== "undefined" && process.env ? process.env : {};
    const baseUrl = env.SYNCTHING_BASE_URL || "http://localhost:8384";
    const endpoints = {
        stats: "/rest/stats/device",
        devices: "/rest/config/devices",
    };
    const apiKey = env.SYNCTHING_API_KEY || "";
    const currentDate = dayjs();

    const [statsResponse, configResponse] = await Promise.all([
        fetch(`${baseUrl}${endpoints.stats}`, {
            method: "GET",
            headers: { "X-API-Key": apiKey },
        }),
        fetch(`${baseUrl}${endpoints.devices}`, {
            method: "GET",
            headers: { "X-API-Key": apiKey },
        }),
    ]);
    const statsResult = await handleResponse(statsResponse);
    const devicesResult = await handleResponse(configResponse);

    if (!devicesResult.ok) {
        res.status(500).send({
            error: `Fetching Syncthing devices failed ${devicesResult.status})`,
        });
        return;
    }

    const devicesList = devicesResult.value || [];
    const statsObj = statsResult.ok ? statsResult.value : {};

    const indexById = new Map(devicesList.map((item, i) => [item.deviceID, i]));

    for (const [deviceID, deviceStats] of Object.entries(statsObj || {})) {
        const idx = indexById.get(deviceID);
        if (idx !== undefined) {
            devicesList[idx].sinceLastSeen = sinceLastSeenFrom(
                deviceStats.lastSeen,
                currentDate
            );
        }
    }

    res.send(
        devicesList.map((device) => ({
            name: device.name,
            sinceLastSeen: device.sinceLastSeen,
        }))
    );
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
