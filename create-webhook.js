import axios from "axios";

const CLIENT_ID = "262560";
const CLIENT_SECRET = "YOUR_REAL_SECRET";

const CALLBACK_URL = "https://YOUR-NGROK-URL/webhook";
const VERIFY_TOKEN = "mamb_verify_token";

async function run() {
  try {
    const res = await axios.post(
      "https://www.strava.com/api/v3/push_subscriptions",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        callback_url: CALLBACK_URL,
        verify_token: VERIFY_TOKEN
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
}

run();
