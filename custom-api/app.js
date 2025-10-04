import express from "express";

const app = express();
const PORT = 3000;

const MENSA_URL = "https://openmensa.org/api/v2";

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

app.get("/mensa/:id", async (req, res) => {
    const { id } = req.params;
    const date = getCurrentDate();

    const mealUri = `${MENSA_URL}/canteens/${id}/days/${date}/meals`;

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

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
