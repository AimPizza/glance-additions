import express from "express";
import { getDateOfDelta, handleResponse, makeError } from "../common/helpers.js";
import { HandledResponse, MensaCanteen } from "../common/types.js";

const router = express.Router();

async function getMealsForDay(canteenId: number, date: string): Promise<HandledResponse> {
    const mensaUrl = "https://openmensa.org/api/v2";
    const mealUri = `${mensaUrl}/canteens/${canteenId}/days/${date}/meals`;

    let mensaResponse: HandledResponse = await handleResponse(await fetch(mealUri));
    if (!mensaResponse.ok) {
        let mealStatusMessage = "Fetching Mensa failed.";
        if (mensaResponse.status === 404) {
            const mensaInfo = await handleResponse<MensaCanteen>(
                await fetch(`${mensaUrl}/canteens/${canteenId}`),
            );
            mealStatusMessage = mensaInfo.ok ? `No meals found for ${date}. Mensa: ${mensaInfo.value?.name}` : `Couldn't fetch Mensa ${canteenId} (status: ${mensaInfo.status})`;
        }
        mensaResponse.value = mealStatusMessage;
    }

    return mensaResponse;
}

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const date = getDateOfDelta(0);
    const meals = await getMealsForDay(Number(id), date);

    res.status(meals.status).send(meals.value);
    return;
});

router.get("/:id/offset/:offset", async (req, res) => {
    const { id, offset } = req.params;
    const parsedOffset = Number(offset);
    if (!Number.isInteger(parsedOffset)) {
        res.status(400).send(makeError(`Invalid offset: ${offset}`));
        return;
    }

    const date = getDateOfDelta(parsedOffset);

    const meals = await getMealsForDay(Number(id), date);
    res.status(meals.status).send(meals.value);
    return;
});

export default router;
