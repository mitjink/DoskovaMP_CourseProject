const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'pool_db',
});

pool.on('connect', () => {
    console.log('Подключение к PostgreSQL установлено');
});

pool.on('error', (err) => {
    console.error('Ошибка подключения к PostgreSQL:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};