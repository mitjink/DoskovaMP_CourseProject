const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const authRoutes = require('./routes/authRoutes');
const poolRoutes = require('./routes/poolRoutes');
const coachRoutes = require('./routes/coachRoutes');
const groupRoutes = require('./routes/groupRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/pools', poolRoutes);
app.use('/api/v1/coaches', coachRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/reports', reportRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Внутренняя ошибка сервера'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});