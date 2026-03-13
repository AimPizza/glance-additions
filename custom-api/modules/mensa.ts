import express from "express";
import { getCurrentDate, handleResponse } from "../common/helpers.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
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
                await fetch(`${mensaUrl}/canteens/${id}`),
            );
            mealStatusMessage = `No meals found for today. Mensa: ${mensaInfo.value?.name}`;
        }
        res.status(500).send({ error: mealStatusMessage });
        return;
    }

    res.send(mensaResponse.value);
});

export default router;
