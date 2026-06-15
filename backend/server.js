// .env file ko load karne ke liye
require('dotenv').config();

// app.js file se express application le aao
const app = require('./src/app');

// Port set karna (.env me hai toh wo lo, warna 5000)
const PORT = process.env.PORT || 5000;

// Server ko start karna
app.listen(PORT, () => {
  console.log(`🚀 Tailor Backend Server Start Ho Gaya Hai!`);
  console.log(`🔗 Link: http://localhost:${PORT}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
});