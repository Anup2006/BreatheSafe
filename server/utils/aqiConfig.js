export const getAQIConfig = (aqi) => {
  if (aqi <= 2)
    return {
      status: "Good",
      bgColor: "#c8e6c9",
      textColor: "#256029",
      advice: "Air quality is good. Enjoy outdoor activities 🌱",
    };

  if (aqi === 3)
    return {
      status: "Moderate",
      bgColor: "#fff9c4",
      textColor: "#827717",
      advice: "Sensitive individuals should limit outdoor exertion.",
    };

  if (aqi === 4)
    return {
      status: "Poor",
      bgColor: "#ffe0b2",
      textColor: "#e65100",
      advice: "Avoid heavy outdoor activity. Consider wearing a mask 😷",
    };

  return {
    status: "Very Poor",
    bgColor: "#ffcdd2",
    textColor: "#b71c1c",
    advice: "Stay indoors as much as possible. Air quality is hazardous 🚨",
  };
};
