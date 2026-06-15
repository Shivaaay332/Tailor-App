// Ye function har error ko catch karega aur ek clean JSON message bheja karega
const errorHandler = (err, req, res, next) => {
  console.error("Error Catcher Triggered: ", err.stack); // Terminal me error dekhne ke liye

  // Agar error ka status code nahi hai, toh default 500 (Internal Server Error) set karo
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Kuch galat ho gaya, kripya thodi der baad koshish karein.",
    // Development mode me poora error dikhao, Production me sirf message
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };