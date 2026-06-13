/**
 * Route to get public http resources according to Pangolin Api v1
 * @see https://api.pangolin.net/v1/docs/#/Public%20Resource/get_org__orgId__resources
 */
import express from "express";
import { makeError, getSelfhstIconUrl, handleResponse } from "../common/helpers.js";
import {
    PangolinResource,
    PangolinResources,
    PangolinResponseObj,
    PangolinTarget,
} from "../common/types.js";

const router = express.Router();

/**
 * Calculate health status based on target health statuses
 * @param {Array} targets - Array of target objects with healthStatus property
 * @returns {string} - One of: healthy, degraded, offline, unknown, no_targets
 */
function calculateHealthStatus(targets: PangolinTarget[]): string {
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

async function getResources(baseUrl: string, orgId: string, key: string): Promise<PangolinResource[]> {
    const fetchPage = (page: number) => {
        const url = `${baseUrl}/v1/org/${orgId}/resources?page=${page}`;
        return fetch(url, {
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }
        }).then(handleResponse<PangolinResources>);
    };

    const firstResponse = await fetchPage(1);
    if (!firstResponse.ok || !firstResponse.value) {
        throw new Error(`Failed to fetch initial page (${firstResponse.status})`);
    }

    const { total, pageSize } = firstResponse.value.data.pagination;
    const resources: PangolinResource[] = [...firstResponse.value.data.resources];

    const totalPages = Math.ceil(total / pageSize);

    if (totalPages > 1) {
        const pagePromises = [];
        for (let page = 2; page <= totalPages; page++) {
            pagePromises.push(fetchPage(page));
        }

        const results = await Promise.all(pagePromises);

        for (const res of results) {
            if (res.ok && res.value?.data.resources) {
                resources.push(...res.value.data.resources);
            } else {
                throw new Error("One of the parallel page requests failed.");
            }
        }
    }

    return resources;
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


    try {
        const resources: PangolinResource[] = await getResources(baseUrl, orgId, apiKey);
        let resp: PangolinResponseObj[] = [];

        for (const resource of resources) {
            if (!resource.http) continue;

            const iconUrl = await getSelfhstIconUrl(resource.niceId, resource.name);
            const healthStatus = calculateHealthStatus(resource.targets);

            resp.push({
                name: resource.name,
                url: `https://${resource.fullDomain}`,
                healthStatus: healthStatus,
                ...(iconUrl !== null ? { iconUrl } : {}),
            });
        }

        res.send(resp);
    } catch (error) {
        res.status(500).send(makeError("" + error))
    }
});

export default router;
