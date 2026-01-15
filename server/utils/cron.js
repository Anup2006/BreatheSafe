import cron from "node-cron";
import User from "../models/user.model.js";
import { getAQIForCity } from "./aqiService.js";
import { sendMail } from "./mailer.js";
import { getAQIEmailHTML } from "./aqiTemplate.js";
import { getAQIConfig } from "./aqiConfig.js";
import { chunkArray, sleep } from "./batch.js";

const BATCH_SIZE = 2; // 🔹 emails per batch
const BATCH_DELAY = 1500; // 🔹 delay between batches (ms)

console.log("🧠 AQI cron loaded");

cron.schedule("*/1 * * * *", async () => {
  console.log("🌅 AQI cron triggered");

  const users = await User.find({
    "preferences.airQuality": true,
  });

  console.log(`👥 Total users: ${users.length}`);

  const batches = chunkArray(users, BATCH_SIZE);
  console.log(`📦 Total batches: ${batches.length}`);

  for (let i = 0; i < batches.length; i++) {
    console.log(`🚚 Processing batch ${i + 1}/${batches.length}`);

    const batch = batches[i];

    for (const user of batch) {
      try {
        const aqi = await getAQIForCity(user.city);
        const config = getAQIConfig(aqi);

        const html = getAQIEmailHTML({
          city: user.city,
          aqi,
          ...config,
        });

        await sendMail({
          to: user.email,
          subject: `🌬️ Daily AQI Update for ${user.city}`,
          html,
        });

        console.log(`✅ Sent → ${user.email}`);
      } catch (err) {
        console.error(`❌ Failed → ${user.email}`, err.message);
      }
    }

    // ⏸️ wait before next batch
    if (i < batches.length - 1) {
      console.log(`⏳ Waiting ${BATCH_DELAY}ms`);
      await sleep(BATCH_DELAY);
    }
  }

  console.log("🎉 AQI cron completed");
});
