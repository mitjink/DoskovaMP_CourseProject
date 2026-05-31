const db = require('../config/database');

const getAllPasses = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM subscriptions ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения списка абонементов' });
    }
};

const getPassById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM subscriptions WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Абонемент не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения абонемента' });
    }
};

const createPass = async (req, res) => {
    try {
        const { name, frequency, price } = req.body;
        
        if (!name || !frequency || !price) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        
        const validFrequencies = [1, 2, 3, 5];
        if (!validFrequencies.includes(frequency)) {
            return res.status(400).json({ error: 'Частота должна быть 1, 2, 3 или 5' });
        }
        
        const result = await db.query(
            'INSERT INTO subscriptions (name, frequency, price) VALUES ($1, $2, $3) RETURNING *',
            [name, frequency, price]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка создания абонемента' });
    }
};

const updatePass = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, frequency, price } = req.body;
        
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (frequency !== undefined) {
            const validFrequencies = [1, 2, 3, 5];
            if (!validFrequencies.includes(frequency)) {
                return res.status(400).json({ error: 'Частота должна быть 1, 2, 3 или 5' });
            }
            updates.push(`frequency = $${paramCount++}`);
            values.push(frequency);
        }
        if (price !== undefined) {
            updates.push(`price = $${paramCount++}`);
            values.push(price);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'Нет данных для обновления' });
        }
        
        values.push(id);
        
        const result = await db.query(
            `UPDATE subscriptions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Абонемент не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка обновления абонемента' });
    }
};

const deletePass = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM subscriptions WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Абонемент не найден' });
        }
        
        res.json({ message: 'Абонемент успешно удалён' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка удаления абонемента' });
    }
};

const getMySubscriptions = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await db.query(`
            SELECT us.*, 
                   s.name as subscription_name, 
                   s.frequency, 
                   s.price,
                   g.number as group_number
            FROM user_subscriptions us
            JOIN subscriptions s ON us.subscription_id = s.id
            JOIN groups g ON us.group_id = g.id
            WHERE us.user_id = $1
            ORDER BY us.purchase_date DESC
        `, [userId]);
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения покупок' });
    }
};

const buySubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const { passId, groupId } = req.body;
        
        if (!passId || !groupId) {
            return res.status(400).json({ error: 'passId и groupId обязательны' });
        }
        
        const groupCheck = await db.query('SELECT id FROM groups WHERE id = $1', [groupId]);
        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Группа не найдена' });
        }
        
        const passCheck = await db.query('SELECT id FROM subscriptions WHERE id = $1', [passId]);
        if (passCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Абонемент не найден' });
        }
        
        const duplicateCheck = await db.query(
            `SELECT id FROM user_subscriptions 
             WHERE user_id = $1 AND subscription_id = $2 AND group_id = $3`,
            [userId, passId, groupId]
        );
        
        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Вы уже приобрели этот абонемент для данной группы' });
        }
        
        const result = await db.query(
            `INSERT INTO user_subscriptions (user_id, subscription_id, group_id, purchase_date) 
             VALUES ($1, $2, $3, CURRENT_DATE) RETURNING *`,
            [userId, passId, groupId]
        );
        
        res.status(201).json({
            message: 'Абонемент оформлен. Оплатите его в спортивном клубе при следующем посещении.',
            subscription: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка покупки абонемента' });
    }
};

module.exports = {
    getAllPasses,
    getPassById,
    createPass,
    updatePass,
    deletePass,
    getMySubscriptions,
    buySubscription
};