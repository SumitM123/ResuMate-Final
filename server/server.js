// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import fileParserRouter from './routes/fileParsingAndLogic.js';
// import userRoutes from './routes/createUsers.js';

// const app = express();
// const PORT = process.env.PORT || 5000;

// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/resumate-db', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('Connected to MongoDB');
// }).catch((err) => {
//   console.error('MongoDB connection error:', err);
// });

// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? process.env.CLIENT_URL 
//     : 'http://localhost:3000',
//   credentials: true
// }));

// app.use(express.json({ limit: '50mb' }));

// app.use('/loadingPage', fileParserRouter);
// //app.use('/users', )
// app.use('/users', userRoutes);
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// export default app;