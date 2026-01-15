import axios from "axios";

export const getAQIForCity = async (city) => {
  const geo = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
    params: {
      q: city,
      limit: 1,
      appid: process.env.AQI_API_KEY,
    },
  });

  if (!geo.data.length) throw new Error("Invalid city");

  const { lat, lon } = geo.data[0];

  const res = await axios.get(
    "https://api.openweathermap.org/data/2.5/air_pollution",
    {
      params: { lat, lon, appid: process.env.AQI_API_KEY },
    }
  );

  return res.data.list[0].main.aqi;
};
