const express = require('express');
const cors = require('cors');
require("dotenv").config({ path: "./config.env" });

const connectDB = require('./mongoConnect.js');
connectDB();

const app = express();

//connecting to front end
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// Configure body parser with increased limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', require('./routes/auth.js'));

app.use('/loadingPage', require('./routes/fileParsingAndLogic.js'))
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
