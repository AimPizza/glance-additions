import type { Request, Response } from "express";
import { Router } from "express";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { handleResponse } from "../util.js";

import type {
    SyncthingDevice,
    SyncthingDeviceStats,
    DeviceResponse,
} from "../types.js";

const router = Router();
const NEVER = "never";

function formatDuration(millis: number): string {
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    if (millis < MINUTE) return `${Math.trunc(millis / SECOND)}s`;
    if (millis < HOUR) return `${Math.trunc(millis / MINUTE)}min`;
    if (millis < DAY) return `${Math.trunc(millis / HOUR)}h`;
    return `${Math.trunc(millis / DAY)}d`;
}

function sinceLastSeenFrom(lastSeen: string, now: Dayjs): string {
    const lastSeenParsed = dayjs(lastSeen);
    if (lastSeenParsed.isSame("1970-01-01", "day")) return NEVER;
    // Fix: diff against parsed date
    return formatDuration(now.diff(lastSeenParsed));
}

router.get("/syncthing/devices", async (req: Request, res: Response) => {
    const env =
        typeof process !== "undefined" && process.env ? process.env : {};
    const baseUrl = env.SYNCTHING_BASE_URL || "http://localhost:8384";
    const endpoints = {
        stats: "/rest/stats/device",
        devices: "/rest/config/devices",
    };
    const apiKey = env.SYNCTHING_API_KEY || "";
    const currentDate = dayjs();

    const doFilterNeverDevices = Boolean(req.query.filterNever);

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

    const statsResult = await handleResponse<
        Record<string, SyncthingDeviceStats>
    >(statsResponse);
    const devicesResult = await handleResponse<SyncthingDevice[]>(
        configResponse
    );

    if (!devicesResult.ok) {
        res.status(500).send({
            error: `Fetching Syncthing devices failed (${devicesResult.status})`,
        });
        return;
    }

    const devicesList: SyncthingDevice[] = devicesResult.value ?? [];

    const statsObj: Record<string, SyncthingDeviceStats> =
        statsResult.ok && statsResult.value
            ? statsResult.value
            : ({} as Record<string, SyncthingDeviceStats>);

    const indexById = new Map(devicesList.map((item, i) => [item.deviceID, i]));

    for (const [deviceID, deviceStats] of Object.entries(statsObj) as [
        string,
        SyncthingDeviceStats
    ][]) {
        const idx = indexById.get(deviceID);
        if (idx !== undefined) {
            devicesList[idx].sinceLastSeen = sinceLastSeenFrom(
                deviceStats.lastSeen,
                currentDate
            );
        }
    }

    let filteredDevices = devicesList;
    if (doFilterNeverDevices) {
        filteredDevices = devicesList.filter(
            (device) => device.sinceLastSeen !== NEVER
        );
    }

    const response: DeviceResponse[] = filteredDevices.map((device) => ({
        name: device.name,
        sinceLastSeen: device.sinceLastSeen || NEVER,
    }));

    res.send(response);
});

export default router;
