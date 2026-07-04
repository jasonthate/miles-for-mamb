import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT || 3000,

  STRAVA: {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: process.env.REDIRECT_URI,
  },

  // 7 = August (JavaScript months are 0-11)
  CHALLENGE_MONTH: 7,

  DATABASE: {
    FILE: "miles.db",
  },
};