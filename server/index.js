import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const redisClient = createClient({
  url: process.env.DB_URL,
});
redisClient.on("error", (err) => console.error("Redis Error", err));
await redisClient.connect();

function key(name) {
  return `${process.env.DB_KEY}:${name}`;
}

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

/*app.get("/api/season-averages/:playerId/:season", async (req, res) => {
  const { playerId, season } = req.params;
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
*/
app.get("/api/users", async (req, res) => {
  try {
    const ids = JSON.parse((await redisClient.get(key("users:list"))) || "[]");
    const users = await Promise.all(
      ids.map(async (id) => JSON.parse(await redisClient.get(id)))
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await redisClient.get(key(`user:${req.params.id}`));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(JSON.parse(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, favoriteTeam } = req.body;
    const id = key(`user:${Date.now()}`);
    const user = { id, name, favoriteTeam, favoritePlayers: [] };

    await redisClient.set(id, JSON.stringify(user));

    const listKey = key("users:list");
    const ids = JSON.parse((await redisClient.get(listKey)) || "[]");
    ids.push(id);
    await redisClient.set(listKey, JSON.stringify(ids));

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const userKey = key(`user:${req.params.id}`);
    const existing = await redisClient.get(userKey);
    if (!existing) return res.status(404).json({ error: "User not found" });

    const updated = { ...JSON.parse(existing), ...req.body };
    await redisClient.set(userKey, JSON.stringify(updated));
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.get("/api/active-user", async (req, res) => {
  try {
    const activeId = await redisClient.get(key("activeUser"));
    if (!activeId) return res.json(null);
    const user = await redisClient.get(activeId);
    res.json(user ? JSON.parse(user) : null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch active user" });
  }
});

app.post("/api/active-user", async (req, res) => {
  try {
    const { id } = req.body;
    await redisClient.set(key("activeUser"), id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to set active user" });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});