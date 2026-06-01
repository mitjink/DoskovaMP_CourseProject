const db = require('../config/database');

const getCoachesByPool = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                p.id as pool_id,
                p.name as pool_name,
                json_agg(json_build_object('id', c.id, 'fullName', c.full_name)) as coaches
            FROM pools p
            LEFT JOIN coaches c ON c.pool_id = p.id
            GROUP BY p.id, p.name
            ORDER BY p.id
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка формирования отчёта' });
    }
};

const getProfitByCoach = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                c.id as coach_id,
                c.full_name as coach_name,
                p.id as pool_id,
                p.name as pool_name,
                COALESCE(SUM(s.price), 0) as total_revenue
            FROM coaches c
            JOIN pools p ON c.pool_id = p.id
            LEFT JOIN groups g ON g.coach_id = c.id
            LEFT JOIN user_subscriptions us ON us.group_id = g.id
            LEFT JOIN subscriptions s ON us.subscription_id = s.id
            GROUP BY c.id, c.full_name, p.id, p.name
            ORDER BY p.id, total_revenue DESC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка формирования отчёта' });
    }
};

const getCoachesWithBeginners = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT DISTINCT
                c.id,
                c.full_name,
                p.id as pool_id,
                p.name as pool_name
            FROM coaches c
            JOIN pools p ON c.pool_id = p.id
            JOIN groups g ON g.pool_id = p.id
            WHERE g.category = 'beginners'
            ORDER BY c.id
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка формирования отчёта' });
    }
};

const getVisitorsByCoach = async (req, res) => {
    try {
        const { coachId } = req.params;
        
        const coachCheck = await db.query('SELECT id FROM coaches WHERE id = $1', [coachId]);
        if (coachCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Тренер не найден' });
        }
        
        const result = await db.query(`
            SELECT DISTINCT
                u.id as user_id,
                u.email,
                u.full_name,
                g.id as group_id,
                g.number as group_number
            FROM users u
            JOIN user_subscriptions us ON us.user_id = u.id
            JOIN groups g ON us.group_id = g.id
            WHERE g.coach_id = $1
            ORDER BY u.full_name
        `, [coachId]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения посетителей тренера:', error);
        res.status(500).json({ error: 'Ошибка формирования отчёта' });
    }
};

const getGroupsByDay = async (req, res) => {
    try {
        const coachesResult = await db.query(`
            SELECT 
                p.id as pool_id,
                p.name as pool_name,
                c.work_days,
                COUNT(DISTINCT g.id) as groups_count
            FROM pools p
            JOIN coaches c ON c.pool_id = p.id
            JOIN groups g ON g.pool_id = p.id
            GROUP BY p.id, p.name, c.work_days
        `);
        
        const poolsMap = {};
        
        for (const row of coachesResult.rows) {
            if (!poolsMap[row.pool_id]) {
                poolsMap[row.pool_id] = {
                    poolId: row.pool_id,
                    poolName: row.pool_name,
                    groupsByDay: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
                };
            }
            
            const workDays = row.work_days || [];
            for (const day of workDays) {
                poolsMap[row.pool_id].groupsByDay[day] += parseInt(row.groups_count);
            }
        }
        
        res.json(Object.values(poolsMap));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка формирования отчёта' });
    }
};

const getPoolWithMaxRevenue = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                p.id as pool_id,
                p.name as pool_name,
                COALESCE(SUM(s.price), 0) as total_revenue
            FROM pools p
            LEFT JOIN groups g ON g.pool_id = p.id
            LEFT JOIN user_subscriptions us ON us.group_id = g.id
            LEFT JOIN subscriptions s ON us.subscription_id = s.id
            GROUP BY p.id, p.name
            ORDER BY total_revenue DESC
            LIMIT 1
        `);
        
        if (result.rows.length === 0) {
            return res.json({ message: 'Нет данных о выручке' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка формирования отчёта' });
    }
};

module.exports = {
    getCoachesByPool,
    getProfitByCoach,
    getCoachesWithBeginners,
    getVisitorsByCoach,
    getGroupsByDay,
    getPoolWithMaxRevenue
};