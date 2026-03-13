import express from "express";
import dayjs from "dayjs";
import { handleResponse, formatDuration } from "../common/helpers.js";
import { SyncthingDevice, SyncthingDeviceStats } from "../common/types.js";

const router = express.Router();

function sinceLastSeenFrom(lastSeen: string, now: dayjs.Dayjs) {
    const lastSeenParsed = dayjs(lastSeen);
    if (lastSeenParsed.isSame("1970-01-01", "day")) return "never";
    return formatDuration(now.diff(lastSeen));
}

router.get("/devices", async (req, res) => {
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
            error: `Fetching Syncthing devices failed (${devicesResult.status})`,
        });
        return;
    }

    const devicesList: SyncthingDevice[] = devicesResult.value || [];
    const statsObj: SyncthingDeviceStats = statsResult.ok
        ? statsResult.value
        : {};

    const indexById = new Map(devicesList.map((item, i) => [item.deviceID, i]));

    for (const [deviceID, deviceStats] of Object.entries(statsObj || {})) {
        const idx = indexById.get(deviceID);
        if (idx !== undefined) {
            devicesList[idx].sinceLastSeen = sinceLastSeenFrom(
                deviceStats.lastSeen,
                currentDate,
            );
        }
    }

    res.send(
        devicesList.map((device) => ({
            name: device.name,
            sinceLastSeen: device.sinceLastSeen,
        })),
    );
});

export default router;
