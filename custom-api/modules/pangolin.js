/**
 * Route to get public http resources according to Pangolin Api v1
 * @see https://api.pangolin.net/v1/docs/#/Public%20Resource/get_org__orgId__resources
 */
import express from "express";
import { handleResponse } from "../common/helpers.js";

const router = express.Router();

router.get("/public-http-resources", async (req, res) => {
    const env =
        typeof process !== "undefined" && process.env ? process.env : {};

    const baseUrl = env.PANGOLIN_BASE_URL;
    if (!baseUrl) {
        res.status(500).send({
            error: "Could not obtain Pangolin API baseUrl",
        });
        return;
    }

    const orgId = env.PANGOLIN_ORG_ID;
    if (!orgId) {
        res.status(500).send({
            error: "Could not obtain Pangolin OrgId",
        });
        return;
    }

    const apiKey = env.PANGOLIN_API_KEY;
    if (!apiKey) {
        res.status(500).send({
            error: "Could not obtain Pangolin API key",
        });
        return;
    }

    const resourcesUrl = `${baseUrl}/org/${orgId}/resources`;
    // TODO: authenticate
    const pangoResponse = await handleResponse(await fetch(resourcesUrl));

    if (!pangoResponse.ok) {
        res.status(500).send({
            error: `Fetching Pangolin Resources failed (${pangoResponse.status})`,
        });
        return;
    }

    let resources = [];
    for (const resource in pangoResponse.value.data.resources) {
        if (!resource.http) continue;

        console.log("hey");
    }

    res.send(resources);
});

export default router;
