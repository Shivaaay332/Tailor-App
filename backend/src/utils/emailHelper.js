const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Transporter banana (Email bhejne wala engine)
  const transporter = nodemailer.createTransport({
    // Production me SendGrid, AWS SES ya Gmail App Passwords use hote hain
    service: 'Gmail', 
    auth: {
      user: process.env.EMAIL_USER, // .env file me apna email dalna hoga
      pass: process.env.EMAIL_PASS  // .env file me apna App Password dalna hoga
    }
  });

  // Email ke contents set karna
  const mailOptions = {
    from: `Tailor Manager <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message, // Hum normal text ki jagah HTML email bhejenge
  };

  // Email bhejna
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;