import express from "express"

const app = express()
const PORT = 3000

const MENSA_URL = "https://openmensa.org/api/v2"

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

app.get("/mensa/:id", async (req, res) => {
    const {id} = req.params
    const date = getCurrentDate()

    // should be similar to: https://openmensa.org/api/v2/canteens/69/days/2025-09-30/meals
    const mealUri = `${MENSA_URL}/canteens/${id}/days/${date}/meals`
    console.log(mealUri)
    
    const mensaResponse = await fetch(mealUri)
    if (!mensaResponse.ok) {
        res.status(500).send({error: "Fetching Mensa failed."})
    } else {
        const result = await mensaResponse.json()
        res.send(result)
    }
})

app.listen(PORT, () => {
    console.log("Server running on port", PORT)
})
