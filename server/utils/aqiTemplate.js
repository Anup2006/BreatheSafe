export const getAQIEmailHTML = ({
  city,
  aqi,
  status,
  bgColor,
  textColor,
  advice,
}) => `
<!DOCTYPE html>
<html>
  <body style="background:#f4f6f8;padding:20px;font-family:Arial">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:10px">
      <div style="background:#1e88e5;color:#fff;padding:20px;text-align:center">
        <h2>🌬️ BreatheSafe AI</h2>
        <p>Your Daily Air Quality Brief</p>
      </div>

      <div style="padding:25px">
        <h3>Good Morning 👋</h3>
        <p>Here’s today’s AQI for <strong>${city}</strong></p>

        <div style="
          background:${bgColor};
          color:${textColor};
          padding:20px;
          border-radius:8px;
          text-align:center;
        ">
          <div style="font-size:40px;font-weight:bold">${aqi}</div>
          <div>${status}</div>
        </div>

        <p style="margin-top:20px">${advice}</p>

        <p style="margin-top:25px">
          Stay informed. Breathe smarter 🌱
        </p>

        <p>— Team BreatheSafe AI</p>
      </div>

      <div style="background:#f1f3f5;padding:15px;text-align:center;font-size:12px">
        © ${new Date().getFullYear()} BreatheSafe AI
      </div>
    </div>
  </body>
</html>
`;
