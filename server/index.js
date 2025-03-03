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


// app.get('/', (req, res) => {
//     res.sendFile('dashboard.html', { root: '../client' });
//   });

app.use(express.static('../client'));



// Routes
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api', apiRouter);

// Start server
app.listen(port, () => {
  console.log(`go here http://127.0.0.1:7777/dashboard.html`);
});
