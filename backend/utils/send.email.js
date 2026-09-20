const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "AquaFlow",
          email: process.env.EMAIL_USER,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        textContent: text,
        htmlContent: html,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Brevo email failed: ${response.status} ${error}`
    );
  }

  return await response.json();
};

export default sendEmail;
