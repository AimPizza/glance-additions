import type { Request, Response } from "express";
import { Router } from "express";
import { getCurrentDate, handleResponse } from "../util.js";
import type { MensaCanteen, MensaMeal } from "../types.js";

const router = Router();

router.get("/mensa/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const date = getCurrentDate();
    const mensaUrl = "https://openmensa.org/api/v2";
    const mealUri = `${mensaUrl}/canteens/${id}/days/${date}/meals`;

    const mensaResponse = await handleResponse<MensaMeal[]>(
        await fetch(mealUri)
    );

    if (!mensaResponse.ok) {
        let mealStatusMessage = "Fetching Mensa failed.";
        if (mensaResponse.status === 404) {
            const mensaInfo = await handleResponse<MensaCanteen>(
                await fetch(`${mensaUrl}/canteens/${id}`)
            );
            mealStatusMessage = `No meals found for today. Mensa: ${mensaInfo.value?.name}`;
        }
        res.status(500).send({ error: mealStatusMessage });
        return;
    }

    res.send(mensaResponse.value);
});

export default router;
