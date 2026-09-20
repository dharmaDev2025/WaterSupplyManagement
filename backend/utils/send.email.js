import nodemailer from "nodemailer";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
};

export default sendEmail;
