import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  await transporter.sendMail({
    from: `"Water Delivery" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

export default sendEmail;
