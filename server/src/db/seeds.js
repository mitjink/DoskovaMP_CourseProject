const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seed = async () => {
    try {
        console.log('Начало заполнения базы данных');

        await db.query('TRUNCATE TABLE user_subscriptions CASCADE');
        await db.query('TRUNCATE TABLE refresh_tokens CASCADE');
        await db.query('TRUNCATE TABLE groups CASCADE');
        await db.query('TRUNCATE TABLE coaches CASCADE');
        await db.query('TRUNCATE TABLE subscriptions CASCADE');
        await db.query('TRUNCATE TABLE pools CASCADE');
        await db.query('TRUNCATE TABLE users CASCADE');

        await db.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE pools_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE coaches_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE subscriptions_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE groups_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE user_subscriptions_id_seq RESTART WITH 1');

        const adminHash = await bcrypt.hash('admin123', 10);
        await db.query(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
            ['admin@example.com', adminHash, 'Администратор', 'admin']
        );

        await db.query(`
            INSERT INTO pools (name, address, type) VALUES
            ($1, $2, $3),
            ($4, $5, $6),
            ($7, $8, $9)
        `, [
            'Олимпийский', 'ул. Морская, 15', 'sport',
            'Дельфин', 'пр. Мира, 8', 'wellness',
            'Радуга', 'ул. Солнечная, 22', 'combined'
        ]);

        await db.query(`
            INSERT INTO subscriptions (name, frequency, price) VALUES
            ($1, $2, $3),
            ($4, $5, $6),
            ($7, $8, $9),
            ($10, $11, $12)
        `, [
            'Эконом', 1, 2500,
            'Стандарт', 2, 4500,
            'Оптимальный', 3, 6000,
            'Максимальный', 5, 9000
        ]);

        await db.query(`
            INSERT INTO coaches (full_name, pool_id, work_days) VALUES
            ($1, $2, $3),
            ($4, $5, $6),
            ($7, $8, $9),
            ($10, $11, $12)
        `, [
            'Иванов Александр Владимирович', 1, [1, 3, 5],
            'Петрова Мария Ивановна', 1, [2, 4, 6],
            'Сидоров Дмитрий Петрович', 2, [1, 3, 5],
            'Кузнецова Елена Андреевна', 3, [2, 4]
        ]);

        await db.query(`
            INSERT INTO groups (number, category, pool_id, subscription_id) VALUES
            ($1, $2, $3, $4),
            ($5, $6, $7, $8),
            ($9, $10, $11, $12),
            ($13, $14, $15, $16),
            ($17, $18, $19, $20)
        `, [
            'Группа 1', 'beginners', 1, 2,
            'Группа 2', 'teens', 1, 2,
            'Группа 3', 'adults', 1, 3,
            'Группа 4', 'beginners', 2, 2,
            'Группа 5', 'athletes', 3, 4
        ]);

        console.log('База данных успешно заполнена');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при заполнении базы:', error);
        process.exit(1);
    }
};

seed();