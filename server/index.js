import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

app.get("/api/players", async (req, res) => {
  const { search } = req.query;

  try {
    const response = await fetch(
      `https://api.balldontlie.io/nba/v1/players?search=${encodeURIComponent(search)}`,
      { headers: { Authorization: process.env.NBA_API_KEY } }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch player data" });
  }
});

app.get("/api/season-averages", async (req, res) => {
  const { playerId, season } = req.query;

  try {
    const response = await fetch(
      `https://api.balldontlie.io/nba/v1/season_averages/general?season=${season}&season_type=regular&type=base&player_ids[]=${playerId}`,
      { headers: { Authorization: process.env.NBA_API_KEY } }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch season averages" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});