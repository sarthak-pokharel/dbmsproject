import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import apiRouter from './api/main.js';

const app = express();
const port = process.env.PORT || 7777;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api', apiRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
