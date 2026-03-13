import express from "express";
import mensaRoutes from "./modules/mensa.js";
import syncthingRoutes from "./modules/syncthing.js";
import pangolinRoutes from "./modules/pangolin.js";

const app = express();
const PORT = 3000;

app.use("/mensa", mensaRoutes);
app.use("/syncthing", syncthingRoutes);
app.use("/pangolin", pangolinRoutes);

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
