require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const logger2 = require('./middlewares/logger');
const app = express();
//logger
app.use(logger('dev'));

//loggerMiddleware that i made myself
//app.use(logger2);

app.use(express.json());
app.use(cookieParser());
const connectDB = require('./config/db');
connectDB();;

// Routes
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');

// Use Routes
app.use('/transactions', transactionRoutes);
app.use('/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(process.env.PORT || 5000, () => console.log('Server running'));