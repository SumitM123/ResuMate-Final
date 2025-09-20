import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './mongoConnect.js';
import authRoutes from './routes/auth.js';
import fileParsingRoutes from './routes/fileParsingAndLogic.js';
import userRoutes from './routes/createUsers.js';
dotenv.config({ path: './config.env' });

connectDB();

const app = express();

// Connecting to front end
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Configure body parser with increased limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/loadingPage', fileParsingRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
