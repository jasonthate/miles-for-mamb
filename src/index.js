import express from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs-extra";

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.get("/test", (req, res) => {
  res.send("TEST ROUTE WORKS");
});

// 🔴 STRAVA CREDENTIALS
const CLIENT_ID = "262560";
const CLIENT_SECRET = "a2505d759f9ed5c7be09020adc7ddb3804e9eba1";

// Use the Render URL when deployed
const REDIRECT_URI =
  process.env.REDIRECT_URI ||
  "https://miles-for-mamb-jason.onrender.com/auth/strava/callback";
const RIDERS_FILE = "./riders.json";

let riders = fs.existsSync(RIDERS_FILE)
  ? fs.readJsonSync(RIDERS_FILE)
  : [];

// HOME
app.get("/", (req, res) => {
  res.send(`
    <h1>Miles for MAMB 🚴</h1>
    <a href="/auth/strava">Connect with Strava</a>
  `);
});

// STEP 1
app.get("/auth/strava", (req, res) => {
  const url =
    `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}` +
    `&response_type=code&redirect_uri=${REDIRECT_URI}` +
    `&approval_prompt=force&scope=read,activity:read_all`;

  res.redirect(url);
});

// STEP 2
app.get("/auth/strava/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      "https://www.strava.com/oauth/token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }
    );

    const athlete = response.data.athlete;
    const access_token = response.data.access_token;

    console.log("==================================");
console.log("ADDING OR UPDATING RIDER:", athlete.firstname, athlete.lastname);

// Build the rider object
const riderData = {
  id: athlete.id,
  name: athlete.firstname + " " + athlete.lastname,
  access_token: access_token,
};

// Check if this rider already exists
const existingIndex = riders.findIndex((r) => r.id === athlete.id);

if (existingIndex >= 0) {
  console.log("Updating existing rider...");
  riders[existingIndex] = riderData;
} else {
  console.log("Adding new rider...");
  riders.push(riderData);
}

// Save riders.json
fs.writeJsonSync(RIDERS_FILE, riders, { spaces: 2 });

console.log("Current riders:");
console.log(riders);
console.log("==================================");

    res.send(`
      <h2>Connected Successfully 🚴</h2>
      <p>Welcome ${athlete.firstname}</p>
      <a href="/riders">View Riders</a>
    `);
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.send("Error connecting to Strava");
  }
});

// RIDERS
app.get("/riders", (req, res) => {
  console.log("Riders requested:");
  console.log(riders);

  res.json(riders);
});

// WEBHOOK (unused for now)
app.post("/webhook", (req, res) => {
  console.log("Webhook event received:", req.body);
  res.status(200).send("OK");
});

// ACTIVITIES
app.get("/activities/:id", async (req, res) => {
  const rider = riders.find((r) => r.id == req.params.id);

  if (!rider) {
    return res.status(404).send("Rider not found");
  }

  try {
    const response = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: {
          Authorization: `Bearer ${rider.access_token}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});
// TEST FILE ROUTE (DEBUG ONLY)
import path from "path";

app.get("/test-file", (req, res) => {
  res.sendFile(path.resolve("./public/leaderboard.html"));
});

// LEADERBOARD
app.get("/leaderboard", async (req, res) => {
  console.log("🔥 leaderboard route hit");

  try {
    console.log("Building leaderboard...");
    console.log("Number of riders:", riders.length);

    let results = [];

    for (const rider of riders) {
      console.log("Checking rider:", rider.name);

      const response = await axios.get(
        "https://www.strava.com/api/v3/athlete/activities?per_page=200",
        {
          headers: {
            Authorization: `Bearer ${rider.access_token}`,
          },
        }
      );

      const activities = response.data;

      let totalMeters = 0;

      for (const a of activities) {
        const date = new Date(a.start_date);

        if (a.type === "Ride" && date.getMonth() === 7) {
          totalMeters += a.distance;
        }
      }

      results.push({
        name: rider.name,
        miles: +(totalMeters / 1609.34).toFixed(2),
      });
    }

    results.sort((a, b) => b.miles - a.miles);

    console.log("Leaderboard:", results);

    res.json(results);

  } catch (err) {
    console.log("🔥 LEADERBOARD ERROR:");
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});