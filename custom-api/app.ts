import express from "express";
import mensaRouter from "./routes/openmensa.js";
import syncthingRouter from "./routes/syncthing.js";

const app = express();
const PORT = 3000;

app.use(mensaRouter);
app.use(syncthingRouter);

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
