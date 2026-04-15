/**
 * Route to get public http resources according to Pangolin Api v1
 * @see https://api.pangolin.net/v1/docs/#/Public%20Resource/get_org__orgId__resources
 */
import express from "express";
import { makeError, getSelfhstIconUrl, handleResponse } from "../common/helpers.js";
import {
    PangolinResource,
    PangolinResponseObj,
    PangolinTarget,
} from "../common/types.js";

const router = express.Router();

/**
 * Calculate health status based on target health statuses
 * @param {Array} targets - Array of target objects with healthStatus property
 * @returns {string} - One of: healthy, degraded, offline, unknown, no_targets
 */
function calculateHealthStatus(targets: PangolinTarget[]) {
    if (!targets || targets.length === 0) {
        return "no_targets";
    }

    const healthStatuses = targets.map((target) => target.healthStatus);
    const uniqueStatuses = [...new Set(healthStatuses)];

    if (uniqueStatuses.length === 1 && uniqueStatuses[0] === "unknown") {
        return "unknown";
    }

    const healthyCount = healthStatuses.filter(
        (status) => status === "healthy",
    ).length;
    const totalCount = healthStatuses.length;

    if (healthyCount === totalCount) {
        return "healthy";
    } else if (healthyCount === 0) {
        return "offline";
    } else {
        return "degraded";
    }
}

router.get("/public-http-resources", async (req, res) => {
    const env =
        typeof process !== "undefined" && process.env ? process.env : {};

    const baseUrl = env.PANGOLIN_BASE_URL;
    if (!baseUrl) {
        res.status(500).send(makeError("Could not obtain Pangolin API baseUrl"));
        return;
    }

    const orgId = env.PANGOLIN_ORG_ID;
    if (!orgId) {
        res.status(500).send(makeError("Could not obtain Pangolin OrgId"));
        return;
    }

    const apiKey = env.PANGOLIN_API_KEY;
    if (!apiKey) {
        res.status(500).send(makeError("Could not obtain Pangolin API key"));
        return;
    }

    const resourcesUrl = `${baseUrl}/v1/org/${orgId}/resources`;
    const pangoResponse = await handleResponse(
        await fetch(resourcesUrl, {
            headers: {
                Authorization: "Bearer " + apiKey,
                "Content-Type": "application/json",
            },
        }),
    );

    if (!pangoResponse.ok) {
        res.status(500).send(makeError(
            `Fetching Pangolin Resources failed (${pangoResponse.status})`
        ));
        return;
    }

    let resources: PangolinResponseObj[] = [];
    for (const resource of pangoResponse.value.data
        .resources as PangolinResource[]) {
        if (!resource.http) continue;

        const iconUrl = await getSelfhstIconUrl(resource.niceId, resource.name);
        const healthStatus = calculateHealthStatus(resource.targets);

        resources.push({
            name: resource.name,
            url: `https://${resource.fullDomain}`,
            healthStatus: healthStatus,
            ...(iconUrl !== null ? { iconUrl } : {}),
        });
    }

    res.send(resources);
});

export default router;
