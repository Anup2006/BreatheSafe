import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async ({ to, subject, html }) => {
  await resend.emails.send({
    from: `BreatheSafe AI <${"breathesafeai.aqi.updates.com"}>`,
    to,
    subject,
    html,
  });
};

// try {
//   const response = await sendMail({
//     to: "binay885b@gmail.com",
//     subject: "Resend Hard Test",
//     html: "<h1>If you see this, Resend works 🎉</h1>",
//   });

//   console.log("RESEND RESPONSE:", response);
// } catch (error) {
//   console.log("mailer did not work", error);
// }
