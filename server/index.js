const express = require('express');
const cors = require('cors');
require("dotenv").config({ path: "./config.env" });

const connectDB = require('./mongoConnect.js');
connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());  // important to parse JSON body before routes

app.use('/api/auth', require('./routes/auth.js'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
