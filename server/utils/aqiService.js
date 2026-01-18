import axios from "axios";

export const getAQIForCity = async (city) => {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
    
    const geoRes = await axios.get(geoUrl);
    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      throw new Error(`City '${city}' not found.`);
    }

    const { latitude, longitude } = geoRes.data.results[0];

    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`;

    const aqiRes = await axios.get(aqiUrl);

    const aqi = aqiRes.data.current.us_aqi;

    return aqi;

  } catch (error) {
    // Handle Axios errors or "City not found" errors
    if (error.response) {
       console.error(`Open-Meteo Error (${error.response.status}):`, error.response.data);
       throw new Error(`Open-Meteo API Error`);
    }
    console.error(`AQI Fetch Error for ${city}:`, error.message);
    throw error;
  }
};